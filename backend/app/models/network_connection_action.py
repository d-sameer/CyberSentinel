
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Index, Integer, String, Text

from app.database import Base


class NetworkConnectionAction(Base):
    __tablename__ = "network_connection_actions"

    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(String(255), nullable=False, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=False, default="")
    analyst = Column(String(100), nullable=False, default="SOC Analyst")
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        Index(
            "ix_network_connection_actions_connection_created",
            "connection_id",
            "created_at",
        ),
    )
