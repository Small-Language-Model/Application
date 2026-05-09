from datetime import datetime, timezone, timedelta
from uuid import uuid4

from pydantic import BaseModel, EmailStr, Field


class OTP(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    email: EmailStr
    otp: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(minutes=5))
    is_verified: bool = False
