from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SecurityIntegrationAction(Base):
    __tablename__ = "security_integration_actions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    action_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    integration_id: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    action: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    previous_status: Mapped[str] = mapped_column(
        String(50),
    )

    new_status: Mapped[str] = mapped_column(
        String(50),
    )

    previous_health: Mapped[str] = mapped_column(
        String(50),
    )

    new_health: Mapped[str] = mapped_column(
        String(50),
    )

    actor: Mapped[str] = mapped_column(
        String(100),
        default="Security Admin",
    )

    note: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    result: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )