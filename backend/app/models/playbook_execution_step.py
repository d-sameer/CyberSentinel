from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SecurityPlaybookExecutionStep(Base):
    __tablename__ = "security_playbook_execution_steps"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    execution_id: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    playbook_id: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    step_number: Mapped[int] = mapped_column(
        Integer,
    )

    action: Mapped[str] = mapped_column(
        String(255),
    )

    status: Mapped[str] = mapped_column(
        String(50),
        index=True,
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