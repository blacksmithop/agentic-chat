from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from api.database import get_db
from api.models.user import User
from api.models.message import Message, MessageType
from api.services.auth_service import get_current_user
from api.services.websocket_manager import websocket_manager

router = APIRouter()


class SendMessageRequest(BaseModel):
    content: str
    type: Optional[str] = "message"
    targetUser: Optional[str] = None


@router.post("")
async def send_message(
    request: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if len(request.content.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    if len(request.content) > 500:
        raise HTTPException(status_code=400, detail="Message content too long")

    # Determine message type
    message_type = MessageType.MESSAGE
    if request.type == "whisper":
        message_type = MessageType.WHISPER
        if not request.targetUser:
            raise HTTPException(
                status_code=400, detail="Target user required for whisper"
            )

    # Create message
    message = Message(
        user_id=current_user.id,
        nickname=current_user.nickname,
        content=request.content.strip(),
        message_type=message_type,
        target_user=request.targetUser,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    # Broadcast message via WebSocket
    await websocket_manager.broadcast_message(
        {"type": "message", "data": message.to_dict()}
    )

    return {"success": True, "data": message.to_dict()}


@router.get("")
async def get_messages(
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    before: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Message).filter(
        Message.message_type.in_([MessageType.MESSAGE, MessageType.SYSTEM])
    )

    if before:
        try:
            before_date = datetime.fromisoformat(before.replace("Z", "+00:00"))
            query = query.filter(Message.created_at < before_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")

    messages = (
        query.order_by(desc(Message.created_at)).offset(offset).limit(limit).all()
    )

    # Reverse to get chronological order
    messages.reverse()

    total = query.count()
    has_more = offset + limit < total

    return {
        "success": True,
        "data": [message.to_dict() for message in messages],
        "pagination": {"total": total, "hasMore": has_more},
    }
