
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.database import Base


class User(Base):
    __tablename__ = "auth_users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(254), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    role = Column(String(20), nullable=False, default="Viewer")
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
