from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from api.database import get_db
from api.models.user import User
from api.models.moderation import ModerationLog
from api.services.auth_service import get_current_user
from api.services.websocket_manager import websocket_manager

router = APIRouter()


class ModerationRequest(BaseModel):
    username: str
    reason: Optional[str] = None
    duration: Optional[int] = None  # For bans (hours)


def check_moderation_permission(current_user: User, action: str):
    if "Admin" not in current_user.roles and "Moderator" not in current_user.roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    if action == "ban" and "Admin" not in current_user.roles:
        raise HTTPException(status_code=403, detail="Only admins can ban users")


@router.post("/kick")
async def kick_user(
    request: ModerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check_moderation_permission(current_user, "kick")

    target_user = db.query(User).filter(User.nickname == request.username).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if "Admin" in target_user.roles:
        raise HTTPException(status_code=403, detail="Cannot kick an admin")

    # Log moderation action
    log = ModerationLog(
        action="kick",
        target_user_id=target_user.id,
        moderator_id=current_user.id,
        reason=request.reason,
    )
    db.add(log)
    db.commit()

    # Broadcast moderation action
    await websocket_manager.broadcast_message(
        {
            "type": "moderation",
            "data": {
                "action": "kick",
                "targetUser": target_user.nickname,
                "moderator": current_user.nickname,
                "reason": request.reason,
            },
        }
    )

    return {"success": True, "message": "User kicked successfully"}


@router.post("/ban")
async def ban_user(
    request: ModerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check_moderation_permission(current_user, "ban")

    target_user = db.query(User).filter(User.nickname == request.username).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if "Admin" in target_user.roles:
        raise HTTPException(status_code=403, detail="Cannot ban an admin")

    # Ban the user
    target_user.is_banned = True
    target_user.is_active = False

    # Log moderation action
    log = ModerationLog(
        action="ban",
        target_user_id=target_user.id,
        moderator_id=current_user.id,
        reason=request.reason,
        duration=request.duration,
    )
    db.add(log)
    db.commit()

    # Broadcast moderation action
    await websocket_manager.broadcast_message(
        {
            "type": "moderation",
            "data": {
                "action": "ban",
                "targetUser": target_user.nickname,
                "moderator": current_user.nickname,
                "reason": request.reason,
            },
        }
    )

    return {"success": True, "message": "User banned successfully"}


@router.post("/whitelist")
async def whitelist_user(
    request: ModerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check_moderation_permission(current_user, "ban")  # Same permission as ban

    target_user = db.query(User).filter(User.nickname == request.username).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Unban the user
    target_user.is_banned = False
    target_user.is_active = True

    # Log moderation action
    log = ModerationLog(
        action="whitelist",
        target_user_id=target_user.id,
        moderator_id=current_user.id,
        reason=request.reason,
    )
    db.add(log)
    db.commit()

    return {"success": True, "message": "User whitelisted successfully"}


@router.get("/logs")
async def get_moderation_logs(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    check_moderation_permission(current_user, "view_logs")

    logs = (
        db.query(ModerationLog)
        .order_by(ModerationLog.created_at.desc())
        .limit(50)
        .all()
    )

    return {"success": True, "data": [log.to_dict() for log in logs]}
