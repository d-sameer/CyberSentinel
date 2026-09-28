from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class EndpointTelemetry(Base):
    __tablename__ = "endpoint_telemetry"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    endpoint_id: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    cpu_usage: Mapped[float] = mapped_column(
        Float,
        default=0.0,
    )

    memory_usage: Mapped[float] = mapped_column(
        Float,
        default=0.0,
    )

    disk_usage: Mapped[float] = mapped_column(
        Float,
        default=0.0,
    )

    gateway: Mapped[str] = mapped_column(
        String(50),
        default="",
    )

    dns_server: Mapped[str] = mapped_column(
        String(50),
        default="",
    )

    network_status: Mapped[str] = mapped_column(
        String(30),
        default="CONNECTED",
    )

    collected_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )