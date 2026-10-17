from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class Process(Base):
    __tablename__ = "processes"

    id = Column(Integer, primary_key=True, index=True)

    process_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    pid = Column(Integer, nullable=False)

    endpoint = Column(String(100), nullable=False, index=True)
    user = Column(String(100), nullable=False)

    cpu = Column(String(30), nullable=False)
    memory = Column(String(30), nullable=False)

    parent = Column(String(150), nullable=False)
    command_line = Column(Text, nullable=False)

    status = Column(String(50), nullable=False, index=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )