from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ComplianceControl(Base):
    __tablename__ = "compliance_controls"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    control_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    framework: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    control_name: Mapped[str] = mapped_column(
        String(255),
    )

    description: Mapped[str] = mapped_column(
        Text,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        index=True,
    )

    owner: Mapped[str] = mapped_column(
        String(100),
    )

    evidence_status: Mapped[str] = mapped_column(
        String(30),
        index=True,
    )

    related_event_ids: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    related_alert_ids: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    related_incident_ids: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    last_reviewed: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )