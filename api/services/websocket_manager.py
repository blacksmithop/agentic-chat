from fastapi import WebSocket
from typing import Dict, List, Set
import json
from sqlalchemy.orm import Session

from api.database import SessionLocal
from api.services.auth_service import get_user_from_token
from api.models.user import User


class WebSocketManager:
    def __init__(self):
        # Store active connections with user info
        self.active_connections: Dict[WebSocket, User] = {}
        # Store connections by user ID for easy lookup
        self.user_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, token: str = None):
        await websocket.accept()

        # Authenticate user if token provided
        if token:
            db = SessionLocal()
            try:
                user = get_user_from_token(token, db)
                if user:
                    self.active_connections[websocket] = user
                    if user.id not in self.user_connections:
                        self.user_connections[user.id] = set()
                    self.user_connections[user.id].add(websocket)

                    # Broadcast user joined
                    await self.broadcast_message(
                        {
                            "type": "user_joined",
                            "data": {
                                "nickname": user.nickname,
                                "avatar": user.avatar,
                                "ageGroup": user.age_group,
                                "roles": user.roles,
                            },
                        },
                        exclude_user=user.id,
                    )
            finally:
                db.close()

    async def disconnect(self, websocket: WebSocket):
        user = self.active_connections.get(websocket)
        if user:
            # Remove from connections
            self.user_connections[user.id].discard(websocket)
            if not self.user_connections[user.id]:
                del self.user_connections[user.id]

                # Broadcast user left
                await self.broadcast_message(
                    {"type": "user_left", "data": {"nickname": user.nickname}},
                    exclude_user=user.id,
                )

        if websocket in self.active_connections:
            del self.active_connections[websocket]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except:
            # Connection might be closed
            pass

    async def broadcast_message(self, message: dict, exclude_user: int = None):
        disconnected = []
        for websocket, user in self.active_connections.items():
            if exclude_user and user.id == exclude_user:
                continue
            try:
                await websocket.send_text(json.dumps(message))
            except:
                disconnected.append(websocket)

        # Clean up disconnected websockets
        for websocket in disconnected:
            await self.disconnect(websocket)

    async def send_to_user(self, user_id: int, message: dict):
        if user_id in self.user_connections:
            disconnected = []
            for websocket in self.user_connections[user_id]:
                try:
                    await websocket.send_text(json.dumps(message))
                except:
                    disconnected.append(websocket)

            # Clean up disconnected websockets
            for websocket in disconnected:
                await self.disconnect(websocket)

    async def handle_message(self, websocket: WebSocket, data: dict):
        user = self.active_connections.get(websocket)
        if not user:
            return

        message_type = data.get("type")
        message_data = data.get("data", {})

        if message_type == "typing":
            # Broadcast typing indicator
            await self.broadcast_message(
                {
                    "type": "typing",
                    "data": {
                        "nickname": user.nickname,
                        "isTyping": message_data.get("isTyping", False),
                        "chatType": message_data.get("chatType", "general"),
                        "targetUser": message_data.get("targetUser"),
                    },
                },
                exclude_user=user.id,
            )

        elif message_type == "status_update":
            # Handle status updates
            await self.broadcast_message(
                {
                    "type": "user_status",
                    "data": {
                        "nickname": user.nickname,
                        "status": message_data.get("status"),
                        "lastSeen": message_data.get("lastSeen"),
                    },
                },
                exclude_user=user.id,
            )

    def get_online_users(self) -> List[dict]:
        """Get list of currently online users"""
        users = []
        seen_users = set()
        for user in self.active_connections.values():
            if user.id not in seen_users:
                users.append(user.to_dict())
                seen_users.add(user.id)
        return users


# Global instance
websocket_manager = WebSocketManager()
