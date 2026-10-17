
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Index

from app.database import Base


class NetworkTrafficSnapshot(Base):
    __tablename__ = "network_traffic_snapshots"

    id = Column(Integer, primary_key=True, index=True)

    captured_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        index=True,
    )

    ingress_mb = Column(Float, nullable=False, default=0.0)
    egress_mb = Column(Float, nullable=False, default=0.0)
    total_connections = Column(Integer, nullable=False, default=0)
    suspicious_connections = Column(Integer, nullable=False, default=0)
    blocked_connections = Column(Integer, nullable=False, default=0)

    source = Column(
        String(30),
        nullable=False,
        default="network_api",
    )

    __table_args__ = (
        Index(
            "ix_network_traffic_snapshots_captured_at",
            "captured_at",
        ),
    )
