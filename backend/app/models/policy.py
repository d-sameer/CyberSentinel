from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Policy(Base):
    __tablename__ = "security_policies"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    policy_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
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
        String(50),
        index=True,
    )

    owner: Mapped[str] = mapped_column(
        String(100),
    )

    version: Mapped[str] = mapped_column(
        String(30),
    )

    effective_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    review_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    frameworks: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    related_control_ids: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    related_risk_ids: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
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