from datetime import datetime
from uuid import uuid4

from pydantic import BaseModel, Field


class BillingRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    amount: int
    currency: str = "INR"
    payment_type: str
    tokens_purchased: int | None = None
    subscription_plan: str | None = None
    subscription_days: int | None = None
    order_id: str
    payment_id: str | None = None
    signature: str | None = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
