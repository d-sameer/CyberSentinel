from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SecurityAsset(Base):
    __tablename__ = "security_assets"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    asset_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255))

    description: Mapped[str] = mapped_column(Text)

    asset_type: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    environment: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    location: Mapped[str] = mapped_column(String(150))

    owner: Mapped[str] = mapped_column(String(100))

    business_unit: Mapped[str] = mapped_column(String(100))

    operating_system: Mapped[str] = mapped_column(String(150))

    technologies: Mapped[str] = mapped_column(Text)

    criticality: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    business_importance: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    security_status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    exposure: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    risk_level: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    ip_address: Mapped[str] = mapped_column(String(100))

    hostname: Mapped[str] = mapped_column(String(255))

    related_endpoint_ids: Mapped[str] = mapped_column(Text)

    related_vulnerability_ids: Mapped[str] = mapped_column(Text)

    related_incident_ids: Mapped[str] = mapped_column(Text)

    related_alert_ids: Mapped[str] = mapped_column(Text)

    related_architecture_ids: Mapped[str] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )