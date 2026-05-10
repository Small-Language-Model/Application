from datetime import datetime
from uuid import uuid4
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
	id: str = Field(default_factory=lambda: str(uuid4()))
	full_name: str = Field(..., min_length=1, max_length=100)
	email: EmailStr
	hashed_password: Optional[str] = None
	auth_type: str = Field(default="emailandpassword")  # emailandpassword or google
	google_id: Optional[str] = None
	is_verified: bool = False
	profile_image_url: Optional[str] = None
	profile_image_public_id: Optional[str] = None
	# Token & subscription fields
	tokens_remaining: int = 0
	last_token_grant_date: Optional[str] = None
	subscription_plan: Optional[str] = None
	subscription_expires_at: Optional[datetime] = None
	subscription_tokens_per_day: int = 0
