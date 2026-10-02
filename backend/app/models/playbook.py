from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SecurityPlaybook(Base):
    __tablename__ = "security_playbooks"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    playbook_id: Mapped[str] = mapped_column(
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

    severity: Mapped[str] = mapped_column(
        String(30),
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    trigger_type: Mapped[str] = mapped_column(
        String(100),
    )

    target_type: Mapped[str] = mapped_column(
        String(100),
    )

    actions: Mapped[str] = mapped_column(
        Text,
    )

    owner: Mapped[str] = mapped_column(
        String(100),
    )

    version: Mapped[str] = mapped_column(
        String(30),
        default="1.0",
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