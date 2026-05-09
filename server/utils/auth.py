import os
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request as UrlRequest, urlopen
import json

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

from config.db import get_users_collection
from model.user import User


load_dotenv()


SECRET_KEY = os.getenv("JWT_SECRET", os.getenv("SECRET_KEY", "change-this-secret-key"))
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
GOOGLE_AUTH_CLIENT_ID = os.getenv("GOOGLE_AUTH_CLIENT_ID", os.getenv("GOOGLE_CLIENT_ID", "")).strip()
GOOGLE_AUTH_CLIENT_SECRET = os.getenv("GOOGLE_AUTH_CLIENT_SECRET", os.getenv("GOOGLE_CLIENT_SECRET", "")).strip()
GOOGLE_CLIENT_REDIRECT_URL = os.getenv("GOOGLE_CLIENT_REDIRECT_URL", os.getenv("GOOGLE_AUTH_ROOT_URL", "")).strip()
GOOGLE_AUTH_REDIRECT_URL = os.getenv("GOOGLE_AUTH_REDIRECT_URL", "").strip()
GOOGLE_AUTH_SCOPE = "openid email profile"

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    token_data = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    token_data.update({"exp": expire})
    return jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)


async def authenticate_user(email: str, password: str) -> User | None:
    users = get_users_collection()
    doc = await users.find_one({"email": email})
    if not doc:
        return None
    doc.pop("_id", None)
    user = User(**doc)
    if not user.is_verified or not verify_password(password, user.hashed_password):
        return None
    return user


def google_auth_is_configured() -> bool:
    return all([GOOGLE_AUTH_CLIENT_ID, GOOGLE_AUTH_CLIENT_SECRET, GOOGLE_AUTH_REDIRECT_URL])


def build_google_authorization_url(state: str) -> str:
    if not google_auth_is_configured():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google sign-in is not configured",
        )

    query = urlencode({
        "client_id": GOOGLE_AUTH_CLIENT_ID,
        "redirect_uri": GOOGLE_AUTH_REDIRECT_URL,
        "response_type": "code",
        "scope": GOOGLE_AUTH_SCOPE,
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    })
    return f"https://accounts.google.com/o/oauth2/v2/auth?{query}"


def exchange_google_code_for_tokens(code: str) -> dict[str, Any]:
    if not google_auth_is_configured():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google sign-in is not configured",
        )

    payload = urlencode({
        "code": code,
        "client_id": GOOGLE_AUTH_CLIENT_ID,
        "client_secret": GOOGLE_AUTH_CLIENT_SECRET,
        "redirect_uri": GOOGLE_AUTH_REDIRECT_URL,
        "grant_type": "authorization_code",
    }).encode("utf-8")

    request = UrlRequest(
        "https://oauth2.googleapis.com/token",
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to exchange Google authorization code",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def fetch_google_userinfo(access_token: str) -> dict[str, Any]:
    request = UrlRequest(
        "https://openidconnect.googleapis.com/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        method="GET",
    )

    try:
        with urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to fetch Google user profile",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if not payload.get("email"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account email missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not payload.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google email is not verified",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception
        users = get_users_collection()
        doc = await users.find_one({"id": user_id})
        if doc:
            doc.pop("_id", None)
        user = User(**doc) if doc else None
    except Exception:
        raise credentials_exception

    if user is None:
        raise credentials_exception
    return user