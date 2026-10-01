from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PolicyAction(Base):
    __tablename__ = "policy_actions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    policy_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("security_policies.policy_id"),
        index=True,
    )

    action: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    previous_status: Mapped[str] = mapped_column(
        String(50),
    )

    new_status: Mapped[str] = mapped_column(
        String(50),
    )

    note: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    performed_by: Mapped[str] = mapped_column(
        String(100),
        default="GRC Analyst",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )