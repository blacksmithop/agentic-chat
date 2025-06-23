from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from pydantic import BaseModel
from typing import Optional

from api.database import get_db
from api.models.user import User
from api.models.chat import PrivateChat, PrivateMessage
from api.services.auth_service import get_current_user

router = APIRouter()

class SendPrivateMessageRequest(BaseModel):
    content: str

@router.get("")
async def get_private_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chats = db.query(PrivateChat).filter(
        or_(
            PrivateChat.user1_id == current_user.id,
            PrivateChat.user2_id == current_user.id
        )
    ).all()
    
    chat_list = []
    for chat in chats:
        other_user = chat.user2 if chat.user1_id == current_user.id else chat.user1
        
        # Get last message
        last_message = db.query(PrivateMessage).filter(
            PrivateMessage.chat_id == chat.id
        ).order_by(desc(PrivateMessage.created_at)).first()
        
        # Count unread messages
        unread_count = db.query(PrivateMessage).filter(
            PrivateMessage.chat_id == chat.id,
            PrivateMessage.sender_id != current_user.id,
            PrivateMessage.is_read == 0
        ).count()
        
        chat_data = {
            "withUser": other_user.nickname,
            "unreadCount": unread_count
        }
        
        if last_message:
            chat_data["lastMessage"] = {
                "content": last_message.content,
                "timestamp": last_message.created_at.isoformat(),
                "sender": last_message.sender.nickname
            }
        
        chat_list.append(chat_data)
    
    return {
        "success": True,
        "data": chat_list
    }

@router.get("/{username}/messages")
async def get_private_messages(
    username: str,
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    other_user = db.query(User).filter(User.nickname == username).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find or create chat
    chat = db.query(PrivateChat).filter(
        or_(
            and_(PrivateChat.user1_id == current_user.id, PrivateChat.user2_id == other_user.id),
            and_(PrivateChat.user1_id == other_user.id, PrivateChat.user2_id == current_user.id)
        )
    ).first()
    
    if not chat:
        return {
            "success": True,
            "data": [],
            "pagination": {"total": 0, "hasMore": False}
        }
    
    messages = db.query(PrivateMessage).filter(
        PrivateMessage.chat_id == chat.id
    ).order_by(desc(PrivateMessage.created_at)).offset(offset).limit(limit).all()
    
    # Reverse to get chronological order
    messages.reverse()
    
    total = db.query(PrivateMessage).filter(PrivateMessage.chat_id == chat.id).count()
    has_more = offset + limit < total
    
    return {
        "success": True,
        "data": [message.to_dict() for message in messages],
        "pagination": {
            "total": total,
            "hasMore": has_more
        }
    }

@router.post("/{username}/messages")
async def send_private_message(
    username: str,
    request: SendPrivateMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    other_user = db.query(User).filter(User.nickname == username).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if len(request.content.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message content cannot be empty")
    
    # Find or create chat
    chat = db.query(PrivateChat).filter(
        or_(
            and_(PrivateChat.user1_id == current_user.id, PrivateChat.user2_id == other_user.id),
            and_(PrivateChat.user1_id == other_user.id, PrivateChat.user2_id == current_user.id)
        )
    ).first()
    
    if not chat:
        chat = PrivateChat(
            user1_id=current_user.id,
            user2_id=other_user.id
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
    
    # Create message
    message = PrivateMessage(
        chat_id=chat.id,
        sender_id=current_user.id,
        content=request.content.strip()
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return {
        "success": True,
        "data": message.to_dict()
    }

@router.put("/{username}/read")
async def mark_chat_as_read(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    other_user = db.query(User).filter(User.nickname == username).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find chat
    chat = db.query(PrivateChat).filter(
        or_(
            and_(PrivateChat.user1_id == current_user.id, PrivateChat.user2_id == other_user.id),
            and_(PrivateChat.user1_id == other_user.id, PrivateChat.user2_id == current_user.id)
        )
    ).first()
    
    if chat:
        # Mark messages as read
        db.query(PrivateMessage).filter(
            PrivateMessage.chat_id == chat.id,
            PrivateMessage.sender_id != current_user.id
        ).update({"is_read": 1})
        db.commit()
    
    return {
        "success": True,
        "message": "Chat marked as read"
    }
