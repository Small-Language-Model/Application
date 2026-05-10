from datetime import datetime

from pydantic import BaseModel


class ChatHistoryItem(BaseModel):
    id: str
    user_id: str
    prompt: str
    response: str
    tokens_used: int
    created_at: datetime


class ChatHistoryResponse(BaseModel):
    history: list[ChatHistoryItem]
