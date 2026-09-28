from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class EndpointActivity(Base):
    __tablename__ = "endpoint_activity"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    activity_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    endpoint_id: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
    )

    description: Mapped[str] = mapped_column(
        Text,
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        index=True,
    )

    category: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        index=True,
    )

    observed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )