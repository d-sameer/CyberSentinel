from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SecurityIntegration(Base):
    __tablename__ = "security_integrations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    integration_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
    )

    description: Mapped[str] = mapped_column(
        Text,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    provider: Mapped[str] = mapped_column(
        String(150),
    )

    integration_type: Mapped[str] = mapped_column(
        String(100),
    )

    status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    health: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    endpoint: Mapped[str] = mapped_column(
        String(255),
    )

    owner: Mapped[str] = mapped_column(
        String(100),
    )

    data_collected: Mapped[str] = mapped_column(
        Text,
    )

    sync_frequency: Mapped[str] = mapped_column(
        String(100),
    )

    last_sync: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    error_message: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )