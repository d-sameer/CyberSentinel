from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text

from app.database import Base


class LiveConnectionInvestigationEvent(Base):
    __tablename__ = "live_connection_investigation_events"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(
        Integer,
        ForeignKey("live_connection_investigations.id"),
        nullable=False,
        index=True,
    )
    event_type = Column(String(30), nullable=False)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    analyst = Column(String(100), nullable=False, default="SOC Analyst")
    notes = Column(Text, nullable=False, default="")
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        Index("ix_live_investigation_events_created", "created_at"),
    )