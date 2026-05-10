from fastapi import APIRouter, Depends, HTTPException, status

from config.db import get_chat_history_collection
from model.chat_history import ChatHistory
from schemas.history import ChatHistoryResponse
from schemas.inference import GenerateRequest, GenerateResponse, InferenceHealthResponse
from utils.auth import get_current_user
from utils.inference import inference_service
from utils.token_manager import consume_tokens, ensure_daily_tokens
from model.user import User


router = APIRouter()


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
