from datetime import datetime

from pydantic import BaseModel, Field


class BillingOrderRequest(BaseModel):
    payment_type: str = Field(..., pattern="^(token_topup|subscription)$")
    tokens: int | None = None
    subscription_plan: str | None = None


class BillingOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    razorpay_key_id: str


class BillingVerifyRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    payment_type: str = Field(..., pattern="^(token_topup|subscription)$")
    tokens: int | None = None
    subscription_plan: str | None = None


class BillingRecordResponse(BaseModel):
    id: str
    user_id: str
    amount: int
    currency: str
    payment_type: str
    tokens_purchased: int | None = None
    subscription_plan: str | None = None
    subscription_days: int | None = None
    order_id: str
    payment_id: str | None = None
    signature: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime
