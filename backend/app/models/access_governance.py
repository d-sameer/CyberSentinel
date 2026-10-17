from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from app.database import Base


class AccessGovernance(Base):
    __tablename__ = "access_governance"

    id = Column(Integer, primary_key=True, index=True)

    # User / identity information
    user_id = Column(String(100), nullable=False, index=True)
    username = Column(String(100), nullable=False, index=True)
    email = Column(String(150), nullable=True)

    # Access information
    role = Column(String(100), nullable=False)
    access_level = Column(String(50), nullable=False)
    permissions = Column(Text, nullable=True)

    # Security controls
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    privileged_access = Column(Boolean, default=False, nullable=False)
    least_privilege_status = Column(String(50), default="Compliant")

    # Access review
    access_review_status = Column(
        String(50),
        default="Pending",
        nullable=False
    )
    last_reviewed = Column(DateTime, nullable=True)
    review_due_date = Column(DateTime, nullable=True)

    # Account lifecycle
    account_status = Column(
        String(50),
        default="Active",
        nullable=False
    )

    # Audit information
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    notes = Column(Text, nullable=True)