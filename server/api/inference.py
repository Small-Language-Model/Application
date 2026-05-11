from fastapi import APIRouter, Depends, HTTPException, status
import os
import httpx

from config.db import get_chat_history_collection
from model.chat_history import ChatHistory
from schemas.history import ChatHistoryResponse
from schemas.inference import GenerateRequest, GenerateResponse, InferenceHealthResponse
from utils.auth import get_current_user
from utils.inference import inference_service
from utils.token_manager import consume_tokens, ensure_daily_tokens
from model.user import User


router = APIRouter()

# Groq enhancement settings
GROQ_API_URL = os.getenv("GROQ_API_URL", "https://api.groq.ai/v1/generate")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
ENHANCE_OUTPUT = os.getenv("ENHANCE_OUTPUT", "false").lower() in ("1", "true", "yes")
# Default system prompt for Groq (override with GROQ_SYSTEM_PROMPT env var)
GROQ_SYSTEM_PROMPT = os.getenv(
    "GROQ_SYSTEM_PROMPT",
    "You are a compact 50M-parameter assistant. Answer concisely and helpfully in 4-5 short lines, directly addressing the user's question. Keep outputs relevant, factual, and simple."
)


@router.get("/health", response_model=InferenceHealthResponse, status_code=status.HTTP_200_OK)
async def inference_health():
    return InferenceHealthResponse(
        model_loaded=inference_service.is_loaded,
        device=inference_service.device,
    )


@router.post("/generate", response_model=GenerateResponse, status_code=status.HTTP_200_OK)
async def generate_response(payload: GenerateRequest, current_user: User = Depends(get_current_user)):
    """
    Generate a medical response for research use only.
    This endpoint does not provide medical advice.
    """
    try:
        current_user = await ensure_daily_tokens(current_user)
        if current_user.tokens_remaining <= 0:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="No tokens remaining. Purchase more tokens or subscribe.",
            )

        response = inference_service.generate(payload)

        # Optionally enhance the generated response via Groq API.
        if ENHANCE_OUTPUT and GROQ_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    groq_payload = {
                        "system": GROQ_SYSTEM_PROMPT,
                        "prompt": payload.prompt,
                        "max_tokens": 200,
                    }
                    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
                    groq_resp = await client.post(GROQ_API_URL, json=groq_payload, headers=headers)
                    if groq_resp.status_code == 200:
                        data = groq_resp.json()
                        groq_text = None
                        if isinstance(data, dict):
                            groq_text = data.get("text") or data.get("output") or data.get("generated_text")
                            if not groq_text and "results" in data and isinstance(data["results"], list) and data["results"]:
                                first = data["results"][0]
                                if isinstance(first, dict):
                                    groq_text = first.get("text") or first.get("output")
                        if groq_text and isinstance(groq_text, str) and groq_text.strip():
                            response = groq_text.strip()
            except Exception:
                # If Groq fails, ignore and use local response
                print(Exception)
                pass

        await consume_tokens(current_user, 1)

        chat_history_collection = get_chat_history_collection()
        history_record = ChatHistory(
            user_id=current_user.id,
            prompt=payload.prompt,
            response=response,
            tokens_used=1,
        )
        await chat_history_collection.insert_one(history_record.model_dump())

        return GenerateResponse(response=response)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(error)) from error
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Inference generation failed",
        ) from error


@router.get("/history", response_model=ChatHistoryResponse, status_code=status.HTTP_200_OK)
async def get_chat_history(current_user: User = Depends(get_current_user)):
    chat_history_collection = get_chat_history_collection()
    cursor = chat_history_collection.find({"user_id": current_user.id}).sort("created_at", -1).limit(50)
    history = []
    async for doc in cursor:
        doc.pop("_id", None)
        history.append(doc)
    return ChatHistoryResponse(history=history)
