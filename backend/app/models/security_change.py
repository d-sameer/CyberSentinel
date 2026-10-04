from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SecurityChange(Base):
    __tablename__ = "security_changes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    change_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)

    change_type: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    priority: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    risk_level: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    approval_status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    implementation_status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    environment: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    asset_id: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    asset_name: Mapped[str] = mapped_column(String(255))

    requester: Mapped[str] = mapped_column(String(100))
    owner: Mapped[str] = mapped_column(String(100))

    business_impact: Mapped[str] = mapped_column(Text)
    security_impact: Mapped[str] = mapped_column(Text)

    implementation_plan: Mapped[str] = mapped_column(Text)
    validation_plan: Mapped[str] = mapped_column(Text)
    rollback_plan: Mapped[str] = mapped_column(Text)

    scheduled_start: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    scheduled_end: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    related_configuration_ids: Mapped[str] = mapped_column(Text)
    related_incident_ids: Mapped[str] = mapped_column(Text)
    related_vulnerability_ids: Mapped[str] = mapped_column(Text)
    related_alert_ids: Mapped[str] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )