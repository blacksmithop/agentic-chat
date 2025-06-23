from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from api.database import Base

class PrivateChat(Base):
    __tablename__ = "private_chats"
    
    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user2_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user1 = relationship("User", foreign_keys=[user1_id])
    user2 = relationship("User", foreign_keys=[user2_id])

class PrivateMessage(Base):
    __tablename__ = "private_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("private_chats.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    embed_data = Column(JSON)
    file_data = Column(JSON)
    is_read = Column(Integer, default=0)  # Bitmask for read status
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    chat = relationship("PrivateChat")
    sender = relationship("User")
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "sender": self.sender.nickname if self.sender else "",
            "content": self.content,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "embedData": self.embed_data,
            "fileData": self.file_data
        }
