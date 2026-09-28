from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Endpoint(Base):
    __tablename__ = "endpoints"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    endpoint_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    hostname: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    ip_address: Mapped[str] = mapped_column(
        String(50),
    )

    operating_system: Mapped[str] = mapped_column(
        String(100),
    )

    status: Mapped[str] = mapped_column(
        String(30),
        index=True,
    )

    risk_level: Mapped[str] = mapped_column(
        String(30),
        index=True,
    )

    agent_status: Mapped[str] = mapped_column(
        String(30),
    )

    last_seen: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    open_alerts: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    open_incidents: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    description: Mapped[str] = mapped_column(
        Text,
        default="",
    )