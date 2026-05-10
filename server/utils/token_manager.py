from datetime import datetime, timezone

from config.db import get_users_collection
from model.user import User


def _today_utc_string() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def is_subscription_active(user: User) -> bool:
    if user.subscription_expires_at is None:
        return False
    return user.subscription_expires_at > datetime.now(timezone.utc)


async def ensure_daily_tokens(user: User) -> User:
    today = _today_utc_string()
    if user.last_token_grant_date == today:
        return user

    users_collection = get_users_collection()
    tokens_delta = 10

    if is_subscription_active(user) and user.subscription_tokens_per_day > 0:
        new_tokens = max(user.tokens_remaining, user.subscription_tokens_per_day)
    else:
        new_tokens = user.tokens_remaining + tokens_delta

    update_data = {
        "tokens_remaining": new_tokens,
        "last_token_grant_date": today,
    }

    await users_collection.update_one({"id": user.id}, {"$set": update_data})
    updated_doc = await users_collection.find_one({"id": user.id})
    if updated_doc is None:
        raise RuntimeError("User not found while updating tokens")
    updated_doc.pop("_id", None)
    return User(**updated_doc)


async def grant_daily_tokens_to_all_users() -> None:
    users_collection = get_users_collection()
    today = _today_utc_string()
    cursor = users_collection.find({})
    async for user_doc in cursor:
        user_doc.pop("_id", None)
        user = User(**user_doc)
        if user.last_token_grant_date == today:
            continue

        if is_subscription_active(user) and user.subscription_tokens_per_day > 0:
            new_tokens = max(user.tokens_remaining, user.subscription_tokens_per_day)
        else:
            new_tokens = user.tokens_remaining + 10

        await users_collection.update_one(
            {"id": user.id},
            {"$set": {"tokens_remaining": new_tokens, "last_token_grant_date": today}},
        )


async def consume_tokens(user: User, amount: int = 1) -> User:
    if amount < 1:
        raise ValueError("Token consumption amount must be positive")
    users_collection = get_users_collection()
    if user.tokens_remaining < amount:
        raise ValueError("Insufficient tokens")

    updated_amount = user.tokens_remaining - amount
    await users_collection.update_one(
        {"id": user.id},
        {"$set": {"tokens_remaining": updated_amount}},
    )
    updated_doc = await users_collection.find_one({"id": user.id})
    if updated_doc is None:
        raise RuntimeError("User not found while deducting tokens")
    updated_doc.pop("_id", None)
    return User(**updated_doc)
