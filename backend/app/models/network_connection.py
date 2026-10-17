from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class NetworkConnection(Base):
    __tablename__ = "network_connections"

    id = Column(Integer, primary_key=True, index=True)

    connection_id = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    source_ip = Column(
        String(100),
        nullable=False,
    )

    destination_ip = Column(
        String(100),
        nullable=False,
    )

    protocol = Column(
        String(20),
        nullable=False,
    )

    port = Column(
        Integer,
        nullable=False,
    )

    endpoint = Column(
        String(100),
        nullable=False,
    )

    traffic = Column(
        String(50),
        nullable=False,
    )

    status = Column(
        String(30),
        nullable=False,
    )

    direction = Column(
        String(20),
        nullable=False,
    )

    threat_level = Column(
        String(30),
        nullable=False,
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )