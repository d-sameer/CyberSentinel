from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SecurityConfigurationAction(Base):
    __tablename__ = "security_configuration_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    configuration_id: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    action: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    performed_by: Mapped[str] = mapped_column(
        String(100),
    )

    notes: Mapped[str] = mapped_column(
        Text,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )