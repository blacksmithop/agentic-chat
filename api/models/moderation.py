from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from api.database import Base


class ModerationLog(Base):
    __tablename__ = "moderation_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(20), nullable=False)  # kick, ban, whitelist, mute
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    moderator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text)
    duration = Column(Integer)  # For temporary bans (hours)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    target_user = relationship("User", foreign_keys=[target_user_id])
    moderator = relationship("User", foreign_keys=[moderator_id])

    def to_dict(self):
        return {
            "id": str(self.id),
            "action": self.action,
            "targetUser": self.target_user.nickname if self.target_user else "",
            "moderator": self.moderator.nickname if self.moderator else "",
            "reason": self.reason,
            "duration": self.duration,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
        }
