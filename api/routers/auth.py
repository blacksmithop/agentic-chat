from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

from api.database import get_db
from api.models.user import User, UserStatus
from api.services.auth_service import create_access_token, get_current_user
from api.utils.helpers import generate_avatar_url, get_random_chat_color

router = APIRouter()

class LoginRequest(BaseModel):
    nickname: str
    ageGroup: str

class LoginResponse(BaseModel):
    user: dict
    token: str

@router.post("/login", response_model=dict)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Validate nickname length
    if len(request.nickname.strip()) < 4:
        raise HTTPException(
            status_code=400,
            detail="Nickname must be at least 4 characters long"
        )
    
    if len(request.nickname.strip()) > 20:
        raise HTTPException(
            status_code=400,
            detail="Nickname must be at most 20 characters long"
        )
    
    # Check if nickname is already taken
    existing_user = db.query(User).filter(User.nickname == request.nickname.strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Nickname already taken"
        )
    
    # Validate age group
    valid_age_groups = ["teens", "young-adults", "adults"]
    if request.ageGroup not in valid_age_groups:
        raise HTTPException(
            status_code=400,
            detail="Invalid age group"
        )
    
    # Create new user
    user = User(
        nickname=request.nickname.strip(),
        age_group=request.ageGroup,
        avatar=generate_avatar_url(request.nickname.strip()),
        chat_color=get_random_chat_color(),
        roles=["Member"],
        previous_nicknames=[],
        status=UserStatus.ONLINE,
        settings={
            "notifications": {
                "soundEnabled": True,
                "desktopNotifications": True,
                "mentionNotifications": True,
                "privateMessageNotifications": True
            },
            "privacy": {
                "showLastSeen": True,
                "allowPrivateMessages": True,
                "showTypingIndicator": True
            },
            "appearance": {
                "theme": "system",
                "fontSize": "medium",
                "compactMode": False,
                "showAvatars": True
            },
            "chat": {
                "enterToSend": True,
                "showTimestamps": True,
                "groupMessages": True,
                "autoEmbedLinks": True
            }
        }
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create JWT token
    token = create_access_token(data={"sub": str(user.id), "nickname": user.nickname})
    
    return {
        "success": True,
        "data": {
            "user": user.to_dict(),
            "token": token
        }
    }

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {"success": True, "data": current_user.to_dict()}
