from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleSignInRequest(BaseModel):
    credential: str = Field(..., min_length=1)


class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    full_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)


class UserPublic(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    auth_type: str
    is_verified: bool
    profile_image_url: str | None = None
    tokens_remaining: int = 0
    subscription_plan: str | None = None
    subscription_expires_at: datetime | None = None
    subscription_tokens_per_day: int = 0


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
