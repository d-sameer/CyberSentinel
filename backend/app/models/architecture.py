from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SecurityArchitecture(Base):
    __tablename__ = "security_architecture"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    architecture_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255))

    description: Mapped[str] = mapped_column(Text)

    architecture_type: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    zone: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    security_layer: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    component_type: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    criticality: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    owner: Mapped[str] = mapped_column(String(100))

    technologies: Mapped[str] = mapped_column(Text)

    security_controls: Mapped[str] = mapped_column(Text)

    connected_components: Mapped[str] = mapped_column(Text)

    trust_level: Mapped[str] = mapped_column(String(50))

    exposure: Mapped[str] = mapped_column(String(50))

    risk_level: Mapped[str] = mapped_column(
        String(50),
        index=True,
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