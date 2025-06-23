from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any

from api.database import get_db
from api.models.user import User
from api.services.auth_service import get_current_user

router = APIRouter()

class SettingsUpdate(BaseModel):
    notifications: Optional[Dict[str, Any]] = None
    privacy: Optional[Dict[str, Any]] = None
    appearance: Optional[Dict[str, Any]] = None
    chat: Optional[Dict[str, Any]] = None

@router.get("")
async def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "success": True,
        "data": current_user.settings or {}
    }

@router.put("")
async def update_settings(
    settings_update: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_settings = current_user.settings or {}
    
    # Update settings
    if settings_update.notifications:
        current_settings.setdefault("notifications", {}).update(settings_update.notifications)
    
    if settings_update.privacy:
        current_settings.setdefault("privacy", {}).update(settings_update.privacy)
    
    if settings_update.appearance:
        current_settings.setdefault("appearance", {}).update(settings_update.appearance)
    
    if settings_update.chat:
        current_settings.setdefault("chat", {}).update(settings_update.chat)
    
    current_user.settings = current_settings
    db.commit()
    
    return {
        "success": True,
        "message": "Settings updated successfully"
    }
