from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List
from datetime import datetime

from api.database import get_db
from api.models.user import User, UserStatus
from api.services.auth_service import get_current_user
from api.services.websocket_manager import websocket_manager

router = APIRouter()


class StatusUpdateRequest(BaseModel):
    status: str


@router.get("")
async def get_users(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    users = db.query(User).filter(User.is_active == True, User.is_banned == False).all()

    return {"success": True, "data": {"users": [user.to_dict() for user in users]}}


@router.put("/status")
async def update_status(
    request: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        status = UserStatus(request.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")

    current_user.status = status
    current_user.last_seen = func.now()
    db.commit()

    # Broadcast status change
    await websocket_manager.broadcast_message(
        {
            "type": "user_status",
            "data": {
                "nickname": current_user.nickname,
                "status": status.value,
                "lastSeen": datetime.now().isoformat(),
            },
        }
    )

    return {"success": True, "message": f"Status updated to {status.value}"}


@router.get("/{username}/lastseen")
async def get_user_last_seen(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.nickname == username).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found")

    return {
        "success": True,
        "data": {
            "username": user.nickname,
            "lastSeen": user.last_seen.isoformat() if user.last_seen else None,
            "isOnline": user.status == UserStatus.ONLINE,
        },
    }


@router.get("/{username}/profile")
async def get_user_profile(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.nickname == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "data": user.to_dict()}


@router.post("/{username}/friend")
async def add_friend(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_user = db.query(User).filter(User.nickname == username).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot add yourself as friend")

    # In a real implementation, you'd have a friends table
    # For now, just return success
    return {"success": True, "message": "Friend added successfully"}


@router.delete("/{username}/friend")
async def remove_friend(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"success": True, "message": "Friend removed successfully"}


@router.post("/{username}/mute")
async def mute_user(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_user = db.query(User).filter(User.nickname == username).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # In a real implementation, you'd store muted users
    return {"success": True, "message": "User muted successfully"}


@router.post("/{username}/block")
async def block_user(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_user = db.query(User).filter(User.nickname == username).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # In a real implementation, you'd store blocked users
    return {"success": True, "message": "User blocked successfully"}
