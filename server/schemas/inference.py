from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=4000)
    max_new_tokens: int = Field(default=130, ge=1, le=512)
    temperature: float = Field(default=0.25, gt=0.0, le=2.0)
    top_k: int = Field(default=30, ge=1, le=200)
    top_p: float = Field(default=0.9, gt=0.0, le=1.0)
    repetition_penalty: float = Field(default=1.25, ge=1.0, le=3.0)


class GenerateResponse(BaseModel):
    response: str


class InferenceHealthResponse(BaseModel):
    model_loaded: bool
    device: str
