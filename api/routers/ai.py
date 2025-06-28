from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import random

from api.database import get_db
from api.models.user import User
from api.services.auth_service import get_current_user
from api.services.ai_service import get_ai_response

router = APIRouter()


class AskAIRequest(BaseModel):
    question: str
    context: Optional[List[str]] = None


@router.post("/ask")
async def ask_ai(
    request: AskAIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if len(request.question.strip()) == 0:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if len(request.question) > 500:
        raise HTTPException(status_code=400, detail="Question too long")

    try:
        response = await get_ai_response(request.question, request.context)
        confidence = random.uniform(0.7, 1.0)  # Mock confidence score

        return {
            "success": True,
            "data": {"response": response, "confidence": confidence},
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail="AI service unavailable")


@router.get("/conversation/{user_id}")
async def get_ai_conversation(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # In a real implementation, you'd store AI conversations
    return {"success": True, "data": []}
