from sqlalchemy import Column, Integer, String, DateTime, JSON, Enum, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from api.database import Base
import enum

class MessageType(str, enum.Enum):
    MESSAGE = "message"
    SYSTEM = "system"
    WHISPER = "whisper"
    COMMAND = "command"

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    nickname = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(Enum(MessageType), default=MessageType.MESSAGE)
    embed_data = Column(JSON)
    file_data = Column(JSON)
    target_user = Column(String(20))  # For whispers
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "nickname": self.nickname,
            "content": self.content,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "type": self.message_type.value if self.message_type else "message",
            "embedData": self.embed_data,
            "fileData": self.file_data,
            "targetUser": self.target_user
        }
