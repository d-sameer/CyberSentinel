from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SecurityExceptionAction(Base):
    __tablename__ = "security_exception_actions"

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

    exception_id: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    action: Mapped[str] = mapped_column(
        String(50),
    )

    previous_status: Mapped[str] = mapped_column(
        String(50),
    )

    new_status: Mapped[str] = mapped_column(
        String(50),
    )

    actor: Mapped[str] = mapped_column(
        String(100),
        default="Security Admin",
    )

    note: Mapped[str] = mapped_column(
        Text,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )