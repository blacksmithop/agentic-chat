from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from contextlib import asynccontextmanager

from .database import engine, Base
from .routers import auth, messages, users, files, ai, moderation,  private_chats, settings as settings_router
from .services.websocket_manager import WebSocketManager
from .middleware.rate_limit import RateLimitMiddleware
from .config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

# WebSocket manager
websocket_manager = WebSocketManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 ChatConnect API starting up...")
    yield
    # Shutdown
    print("🛑 ChatConnect API shutting down...")

app = FastAPI(
    title="ChatConnect API",
    description="Real-time chat application API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware
app.add_middleware(RateLimitMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(moderation.router, prefix="/api/moderation", tags=["Moderation"])
app.include_router(settings_router.router, prefix="/api/settings", tags=["Settings"])
app.include_router(private_chats.router, prefix="/api/private-chats", tags=["Private Chats"])

# Static files for uploads
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "ChatConnect API is running! 🚀"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    await websocket_manager.connect(websocket, token)
    try:
        while True:
            data = await websocket.receive_json()
            await websocket_manager.handle_message(websocket, data)
    except WebSocketDisconnect:
        await websocket_manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3001,
        reload=True,
        log_level="info"
    )
