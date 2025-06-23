from sqlalchemy import Column, Integer, String, DateTime, JSON, Enum, Boolean
from sqlalchemy.sql import func
from api.database import Base
import enum

class UserStatus(str, enum.Enum):
    ONLINE = "online"
    IDLE = "idle"
    BUSY = "busy"
    INVISIBLE = "invisible"

class UserRole(str, enum.Enum):
    MEMBER = "Member"
    HELPER = "Helper"
    MODERATOR = "Moderator"
    ADMIN = "Admin"
    BOT = "Bot"
    AI_ASSISTANT = "AI Assistant"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(20), unique=True, index=True, nullable=False)
    age_group = Column(String(20), nullable=False)
    avatar = Column(String(500))
    chat_color = Column(String(7), default="#3B82F6")
    roles = Column(JSON, default=["Member"])
    previous_nicknames = Column(JSON, default=[])
    status = Column(Enum(UserStatus), default=UserStatus.ONLINE)
    settings = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    is_banned = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "nickname": self.nickname,
            "ageGroup": self.age_group,
            "avatar": self.avatar,
            "chatColor": self.chat_color,
            "roles": self.roles or ["Member"],
            "previousNicknames": self.previous_nicknames or [],
            "status": self.status.value if self.status else "online",
            "joinedAt": self.created_at.isoformat() if self.created_at else None,
            "lastSeen": self.last_seen.isoformat() if self.last_seen else None
        }

    # Add secret (only known to db and API during validation)
    # Method for frontend-facing usage
    #  @property
    # def public_data(self):
    #     return {
    #         'id': self.id,
    #         'nickname': self.nickname
    #     }