import os
from datetime import datetime, timedelta, timezone

import razorpay
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status

from config.db import get_billing_collection, get_users_collection
from model.billing import BillingRecord
from model.user import User
from schemas.billing import (
    BillingOrderRequest,
    BillingOrderResponse,
    BillingRecordResponse,
    BillingVerifyRequest,
)
from utils.auth import get_current_user

load_dotenv()

router = APIRouter()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise RuntimeError("Razorpay credentials are required in environment variables")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

SUBSCRIPTION_PLANS = {
    "starter": {
        "amount": 199900,  # ₹1999 for starter plan
        "currency": "INR",
        "days": 30,
        "tokens_per_day": 1667,  # 50,000 tokens / 30 days
        "display_name": "Starter Plan - 50,000 tokens/month",
    },
    "pro": {
        "amount": 499900,  # ₹4999 for pro plan
        "currency": "INR",
        "days": 30,
        "tokens_per_day": 6667,  # 200,000 tokens / 30 days
        "display_name": "Pro Plan - 200,000 tokens/month",
    },
    "enterprise": {
        "amount": 1999900,  # ₹19,999 for enterprise plan
        "currency": "INR",
        "days": 30,
        "tokens_per_day": 33333,  # 1,000,000 tokens / 30 days
        "display_name": "Enterprise Plan - 1,000,000 tokens/month",
    },
}

TOKEN_PRICE_PAISA = int(os.getenv("TOKEN_PRICE_PAISA", "100"))


@router.post("/order", response_model=BillingOrderResponse)
async def create_billing_order(
    payload: BillingOrderRequest,
    current_user: User = Depends(get_current_user),
):
    billing_collection = get_billing_collection()

    if payload.payment_type == "token_topup":
        if not payload.tokens or payload.tokens <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A positive token quantity is required for token top-up.",
            )
        amount = payload.tokens * TOKEN_PRICE_PAISA
        receipt = f"token_topup_{current_user.id[:8]}_{int(datetime.now(timezone.utc).timestamp())}"
    else:
        plan = payload.subscription_plan
        if not plan or plan not in SUBSCRIPTION_PLANS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid subscription plan.",
            )
        amount = SUBSCRIPTION_PLANS[plan]["amount"]
        receipt = f"subscription_{plan}_{current_user.id[:8]}_{int(datetime.now(timezone.utc).timestamp())}"

    try:
        order = razorpay_client.order.create(
            {
                "amount": amount,
                "currency": "INR",
                "receipt": receipt,
                "payment_capture": 1,
                "notes": {
                    "user_id": current_user.id,
                    "payment_type": payload.payment_type,
                    "subscription_plan": payload.subscription_plan or "",
                    "tokens": str(payload.tokens or 0),
                },
            }
        )
    except razorpay.errors.BadRequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create Razorpay order: {exc}",
        ) from exc

    record = BillingRecord(
        user_id=current_user.id,
        amount=amount,
        payment_type=payload.payment_type,
        tokens_purchased=payload.tokens if payload.payment_type == "token_topup" else None,
        subscription_plan=payload.subscription_plan if payload.payment_type == "subscription" else None,
        subscription_days=SUBSCRIPTION_PLANS[payload.subscription_plan]["days"] if payload.payment_type == "subscription" else None,
        order_id=order["id"],
        status="created",
    )
    await billing_collection.insert_one(record.model_dump())

    return BillingOrderResponse(
        order_id=order["id"],
        amount=amount,
        currency="INR",
        razorpay_key_id=RAZORPAY_KEY_ID,
    )


@router.post("/verify", response_model=BillingRecordResponse)
async def verify_payment(
    payload: BillingVerifyRequest,
    current_user: User = Depends(get_current_user),
):
    billing_collection = get_billing_collection()
    users_collection = get_users_collection()

    billing_doc = await billing_collection.find_one({"order_id": payload.order_id})
    if not billing_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if billing_doc["status"] == "paid":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order already verified")
    if billing_doc["user_id"] != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    try:
        razorpay_client.utility.verify_payment_signature(
            {
                "razorpay_order_id": payload.order_id,
                "razorpay_payment_id": payload.payment_id,
                "razorpay_signature": payload.signature,
            }
        )
    except razorpay.errors.SignatureVerificationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment signature") from exc

    update_data = {
        "status": "paid",
        "payment_id": payload.payment_id,
        "signature": payload.signature,
        "updated_at": datetime.utcnow(),
    }

    await billing_collection.update_one({"order_id": payload.order_id}, {"$set": update_data})

    user_doc = await users_collection.find_one({"id": current_user.id})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if billing_doc["payment_type"] == "token_topup":
        tokens = billing_doc.get("tokens_purchased") or 0
        new_tokens = user_doc.get("tokens_remaining", 0) + tokens
        await users_collection.update_one(
            {"id": current_user.id},
            {"$set": {"tokens_remaining": new_tokens}},
        )
    else:
        plan = billing_doc.get("subscription_plan")
        plan_data = SUBSCRIPTION_PLANS.get(plan)
        if not plan_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid subscription plan")

        expires_at = datetime.now(timezone.utc) + timedelta(days=plan_data["days"])
        await users_collection.update_one(
            {"id": current_user.id},
            {
                "$set": {
                    "subscription_plan": plan,
                    "subscription_expires_at": expires_at,
                    "subscription_tokens_per_day": plan_data["tokens_per_day"],
                }
            },
        )

    updated_doc = await billing_collection.find_one({"order_id": payload.order_id})
    updated_doc.pop("_id", None)
    return BillingRecordResponse(**updated_doc)


@router.get("/history", response_model=list[BillingRecordResponse])
async def billing_history(current_user: User = Depends(get_current_user)):
    billing_collection = get_billing_collection()
    cursor = billing_collection.find({"user_id": current_user.id}).sort("created_at", -1)
    records = []
    async for doc in cursor:
        doc.pop("_id", None)
        records.append(BillingRecordResponse(**doc))
    return records
