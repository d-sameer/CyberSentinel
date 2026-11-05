from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Index, Integer, String, Text

from app.database import Base


class LiveConnectionInvestigation(Base):
    __tablename__ = "live_connection_investigations"

    id = Column(Integer, primary_key=True, index=True)
    fingerprint = Column(String(64), nullable=False, unique=True, index=True)
    protocol = Column(String(20), nullable=False)
    local_ip = Column(String(100), nullable=False, default="")
    local_port = Column(Integer, nullable=True)
    remote_ip = Column(String(100), nullable=False, default="")
    remote_port = Column(Integer, nullable=True)
    process = Column(String(255), nullable=False, default="")
    pid = Column(Integer, nullable=True)
    status = Column(String(50), nullable=False, default="Under Investigation")
    analyst = Column(String(100), nullable=False, default="SOC Analyst")
    notes = Column(Text, nullable=False, default="")
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        Index("ix_live_investigations_updated", "updated_at"),
    )