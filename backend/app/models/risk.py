from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Risk(Base):
    __tablename__ = "risks"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    risk_id: Mapped[str] = mapped_column(
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

    likelihood: Mapped[int] = mapped_column(
        Integer,
    )

    impact: Mapped[int] = mapped_column(
        Integer,
    )

    inherent_score: Mapped[int] = mapped_column(
        Integer,
    )

    residual_likelihood: Mapped[int] = mapped_column(
        Integer,
    )

    residual_impact: Mapped[int] = mapped_column(
        Integer,
    )

    residual_score: Mapped[int] = mapped_column(
        Integer,
    )

    severity: Mapped[str] = mapped_column(
        String(30),
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    treatment: Mapped[str] = mapped_column(
        String(50),
    )

    owner: Mapped[str] = mapped_column(
        String(100),
    )

    treatment_plan: Mapped[str] = mapped_column(
        Text,
    )

    due_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    related_vulnerability_ids: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    related_incident_ids: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    related_control_ids: Mapped[Optional[str]] = mapped_column(
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