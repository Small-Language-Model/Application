from datetime import datetime, timezone, timedelta
import os
import secrets

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import EmailStr

# In-memory store for OAuth state (with expiry)
_oauth_state_store: dict[str, float] = {}
OAUTH_STATE_EXPIRY_SECONDS = 600  # 10 minutes

from config.db import get_otp_collection, get_users_collection
from model.user import User
from schemas.auth import SendOTPRequest, Token, UserCreate, UserLogin, UserPublic
from utils.auth import (
    authenticate_user,
    build_google_authorization_url,
    create_access_token,
    exchange_google_code_for_tokens,
    fetch_google_userinfo,
    get_current_user,
    get_password_hash,
    verify_password,
    GOOGLE_CLIENT_REDIRECT_URL,
)
from utils.media import delete_image_from_cloudinary, get_default_profile_image_url, upload_image_to_cloudinary
from utils.otp import generate_otp, send_otp_email, verify_otp_expiry

router = APIRouter()


def _normalize_user_doc(doc: dict) -> dict:
    doc.pop("_id", None)
    doc.setdefault("auth_type", "emailandpassword")
    doc.setdefault("google_id", None)
    doc.setdefault("is_verified", False)
    doc.setdefault("profile_image_url", None)
    doc.setdefault("profile_image_public_id", None)
    return doc


def _public_profile_image_url(user: User) -> str:
    return user.profile_image_url or get_default_profile_image_url(user.full_name)


def _user_to_public(user: User) -> UserPublic:
    return UserPublic(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        auth_type=user.auth_type,
        is_verified=user.is_verified,
        profile_image_url=_public_profile_image_url(user),
        tokens_remaining=user.tokens_remaining,
        subscription_plan=user.subscription_plan,
        subscription_expires_at=user.subscription_expires_at,
        subscription_tokens_per_day=user.subscription_tokens_per_day,
    )


async def _upload_profile_image(profile_image: UploadFile | None) -> tuple[str | None, str | None]:
    if profile_image is None:
        return None, None

    file_bytes = await profile_image.read()
    if not file_bytes:
        return None, None

    folder = os.getenv("CLOUDINARY_UPLOAD_FOLDER", "profiles")
    uploaded = upload_image_to_cloudinary(file_bytes, folder=folder)
    return uploaded.get("url"), uploaded.get("public_id")


async def _upsert_google_user(payload: dict) -> User:
    users_collection = get_users_collection()
    email = payload["email"]
    full_name = payload.get("name") or payload.get("given_name") or email.split("@")[0]
    google_id = payload.get("sub")
    profile_image_url = payload.get("picture") or get_default_profile_image_url(full_name)

    existing_doc = await users_collection.find_one({"email": email})
    if existing_doc:
        existing_doc = _normalize_user_doc(existing_doc)
        existing_user = User(**existing_doc)
        update_data: dict = {
            "full_name": existing_user.full_name or full_name,
            "google_id": google_id,
            "auth_type": "google",
            "is_verified": True,
        }

        if not existing_user.profile_image_url and profile_image_url:
            update_data["profile_image_url"] = profile_image_url

        if existing_user.auth_type == "google" and not existing_user.hashed_password:
            update_data["auth_type"] = "google"

        await users_collection.update_one({"id": existing_user.id}, {"$set": update_data})
        refreshed = await users_collection.find_one({"id": existing_user.id})
        return User(**_normalize_user_doc(refreshed))

    user = User(
        full_name=full_name,
        email=email,
        hashed_password=None,
        auth_type="google",
        google_id=google_id,
        is_verified=True,
        profile_image_url=profile_image_url,
        tokens_remaining=10,
        last_token_grant_date=datetime.now(timezone.utc).date().isoformat(),
    )
    await users_collection.insert_one(user.model_dump())
    return user


def _google_success_response(token: str, user: User):
    if GOOGLE_CLIENT_REDIRECT_URL:
        redirect_url = f"{GOOGLE_CLIENT_REDIRECT_URL.rstrip('/')}/#access_token={token}&token_type=bearer&user_id={user.id}"
        return RedirectResponse(url=redirect_url, status_code=status.HTTP_302_FOUND)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "access_token": token,
            "token_type": "bearer",
            "user": _user_to_public(user).model_dump(),
        },
    )


@router.get("/google/start")
async def google_start(request: Request):
    state = secrets.token_urlsafe(32)
    auth_url = build_google_authorization_url(state)
    # Store state with expiry timestamp
    _oauth_state_store[state] = (datetime.now(timezone.utc).timestamp() + OAUTH_STATE_EXPIRY_SECONDS)
    return RedirectResponse(url=auth_url, status_code=status.HTTP_302_FOUND)


@router.get("/google/callback")
async def google_callback(request: Request, code: str | None = None, state: str | None = None, error: str | None = None):
    if error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error)

    if not code or not state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Google authorization code")

    # Validate state from in-memory store
    state_expiry = _oauth_state_store.get(state)
    if not state_expiry or datetime.now(timezone.utc).timestamp() > state_expiry:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google OAuth state")
    
    # Clean up state
    del _oauth_state_store[state]

    tokens = exchange_google_code_for_tokens(code)
    access_token = tokens.get("access_token")
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google access token missing")

    google_profile = fetch_google_userinfo(access_token)
    user = await _upsert_google_user(google_profile)
    app_token = create_access_token(data={"sub": str(user.id)})

    response = _google_success_response(app_token, user)
    return response


@router.post("/send-otp", status_code=status.HTTP_200_OK)
async def send_otp_endpoint(request: SendOTPRequest):
    """Send OTP to email for registration."""
    otp_code = generate_otp()
    await send_otp_email(request.email, otp_code)
    
    otp_collection = get_otp_collection()
    await otp_collection.insert_one({
        "email": request.email,
        "otp": otp_code,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5),
        "is_verified": False,
    })
    return {"message": "OTP sent to email", "email": request.email}


@router.post("/verify-otp", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def verify_otp_and_register(
    full_name: str = Form(...),
    email: EmailStr = Form(...),
    otp: str = Form(...),
    password: str = Form(...),
    profile_image: UploadFile | None = File(None),
):
    """Verify OTP and register user."""
    otp_collection = get_otp_collection()
    users_collection = get_users_collection()
    
    otp_doc = await otp_collection.find_one({"email": email})
    if not otp_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP not found or expired",
        )
    
    if otp_doc["otp"] != otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP",
        )
    
    if not verify_otp_expiry(otp_doc["created_at"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired",
        )
    
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    profile_image_url, profile_image_public_id = await _upload_profile_image(profile_image)
    
    user = User(
        full_name=full_name,
        email=email,
        hashed_password=get_password_hash(password),
        auth_type="emailandpassword",
        is_verified=True,
        profile_image_url=profile_image_url,
        profile_image_public_id=profile_image_public_id,
        tokens_remaining=10,
        last_token_grant_date=datetime.now(timezone.utc).date().isoformat(),
    )
    await users_collection.insert_one(user.model_dump())
    await otp_collection.delete_one({"email": email})
    return _user_to_public(user)


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    users_collection = get_users_collection()
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        auth_type="emailandpassword",
        is_verified=False,
        tokens_remaining=10,
        last_token_grant_date=datetime.now(timezone.utc).date().isoformat(),
    )
    await users_collection.insert_one(user.model_dump())
    return _user_to_public(user)


@router.post("/login", response_model=Token)
async def login(payload: UserLogin):
    user = await authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)


@router.post("/google", response_model=Token)
async def google_login(payload: dict):
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Use /auth/google/start and /auth/google/callback for Google sign-in",
    )


@router.get("/me", response_model=UserPublic)
async def read_current_user(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return _user_to_public(current_user)


@router.get("/users/{user_id}", response_model=UserPublic)
async def get_user(user_id: str):
    """Get user by ID."""
    users_collection = get_users_collection()
    doc = await users_collection.find_one({"id": user_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user = User(**_normalize_user_doc(doc))
    return _user_to_public(user)


@router.patch("/users/{user_id}", response_model=UserPublic)
async def update_user(
    user_id: str,
    full_name: str | None = Form(None),
    email: EmailStr | None = Form(None),
    old_password: str | None = Form(None),
    password: str | None = Form(None),
    profile_image: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
):
    """Update user (partial update)."""
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    users_collection = get_users_collection()
    existing_doc = await users_collection.find_one({"id": user_id})
    if not existing_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing_user = User(**_normalize_user_doc(existing_doc))

    # Verify old password if changing password
    if password is not None:
        if not old_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to change password",
            )
        if not existing_user.hashed_password or not verify_password(old_password, existing_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect",
            )

    update_data: dict = {}
    if full_name is not None:
        update_data["full_name"] = full_name
    if email is not None:
        update_data["email"] = email
    if password is not None:
        update_data["hashed_password"] = get_password_hash(password)

    if profile_image is not None:
        profile_image_url, profile_image_public_id = await _upload_profile_image(profile_image)
        if profile_image_url:
            update_data["profile_image_url"] = profile_image_url
            update_data["profile_image_public_id"] = profile_image_public_id
            if existing_user.profile_image_public_id:
                delete_image_from_cloudinary(existing_user.profile_image_public_id)
    
    if update_data:
        await users_collection.update_one({"id": user_id}, {"$set": update_data})

    doc = await users_collection.find_one({"id": user_id})
    user = User(**_normalize_user_doc(doc))
    return _user_to_public(user)


@router.put("/users/{user_id}", response_model=UserPublic)
async def replace_user(
    user_id: str,
    full_name: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...),
    profile_image: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
):
    """Replace user (full replacement)."""
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    users_collection = get_users_collection()
    existing_doc = await users_collection.find_one({"id": user_id})
    if not existing_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing_user = User(**_normalize_user_doc(existing_doc))

    if existing_user.profile_image_public_id:
        delete_image_from_cloudinary(existing_user.profile_image_public_id)

    profile_image_url, profile_image_public_id = await _upload_profile_image(profile_image)
    user = User(
        id=user_id,
        full_name=full_name,
        email=email,
        hashed_password=get_password_hash(password),
        auth_type="emailandpassword",
        is_verified=existing_user.is_verified,
        profile_image_url=profile_image_url,
        profile_image_public_id=profile_image_public_id,
    )
    result = await users_collection.replace_one({"id": user_id}, user.model_dump())
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _user_to_public(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, current_user: User = Depends(get_current_user)):
    """Delete user."""
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    users_collection = get_users_collection()
    existing_doc = await users_collection.find_one({"id": user_id})
    if not existing_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing_user = User(**_normalize_user_doc(existing_doc))
    if existing_user.profile_image_public_id:
        delete_image_from_cloudinary(existing_user.profile_image_public_id)

    result = await users_collection.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
