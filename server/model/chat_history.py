from datetime import datetime
from uuid import uuid4

from pydantic import BaseModel, Field


class ChatHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    prompt: str
    response: str
    tokens_used: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
