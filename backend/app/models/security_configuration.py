from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SecurityConfiguration(Base):
    __tablename__ = "security_configurations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    configuration_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255))

    description: Mapped[str] = mapped_column(Text)

    configuration_type: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    asset_id: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    asset_name: Mapped[str] = mapped_column(String(255))

    environment: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    baseline: Mapped[str] = mapped_column(String(150))

    baseline_version: Mapped[str] = mapped_column(String(50))

    compliance_status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    severity: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    current_value: Mapped[str] = mapped_column(Text)

    expected_value: Mapped[str] = mapped_column(Text)

    control_reference: Mapped[str] = mapped_column(String(150))

    remediation: Mapped[str] = mapped_column(Text)

    owner: Mapped[str] = mapped_column(String(100))

    last_checked: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
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