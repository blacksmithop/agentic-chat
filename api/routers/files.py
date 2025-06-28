from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import uuid
import aiofiles
from typing import Optional

from api.database import get_db
from api.models.user import User
from api.services.auth_service import get_current_user
from api.config import settings

router = APIRouter()


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    type: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate file type
    if type not in ["image", "video", "file"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    # Check file size
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")

    # Validate MIME type
    if type == "image" and file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image type")
    elif type == "video" and file.content_type not in settings.ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=400, detail="Invalid video type")

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Save file
    try:
        async with aiofiles.open(file_path, "wb") as f:
            content = await file.read()
            await f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save file")

    # Generate URL (in production, this would be a CDN URL)
    file_url = f"/uploads/{unique_filename}"

    return {
        "success": True,
        "data": {
            "url": file_url,
            "filename": file.filename,
            "size": file.size,
            "type": file.content_type,
        },
    }
