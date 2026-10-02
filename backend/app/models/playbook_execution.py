from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SecurityPlaybookExecution(Base):
    __tablename__ = "security_playbook_executions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    execution_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    playbook_id: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    target: Mapped[str] = mapped_column(
        String(255),
    )

    actor: Mapped[str] = mapped_column(
        String(100),
    )

    status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    note: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    step_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    result: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    completed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )