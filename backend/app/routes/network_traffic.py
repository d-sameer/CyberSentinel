
import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_db
from app.models.network_connection import NetworkConnection
from app.models.network_traffic_snapshot import NetworkTrafficSnapshot


logger = logging.getLogger("cybersentinel.network_traffic")

router = APIRouter(
    prefix="/api/network",
    tags=["Network Traffic Analytics"],
)


def traffic_to_mb(value: str) -> float:
    """Convert a traffic value such as KB, MB, or GB into megabytes."""
    if not value:
        return 0.0

    normalized = str(value).strip().upper().replace(",", "")

    try:
        if normalized.endswith("GB"):
            return float(normalized[:-2].strip()) * 1024

        if normalized.endswith("MB"):
            return float(normalized[:-2].strip())

        if normalized.endswith("KB"):
            return float(normalized[:-2].strip()) / 1024

        if normalized.endswith("B"):
            return float(normalized[:-1].strip()) / (1024 * 1024)

        return float(normalized)

    except (TypeError, ValueError):
        return 0.0


def build_snapshot(db: Session) -> NetworkTrafficSnapshot:
    """Calculate current network statistics and save a snapshot."""
    connections = db.scalars(
        select(NetworkConnection)
    ).all()

    ingress_mb = 0.0
    egress_mb = 0.0

    for connection in connections:
        traffic_mb = traffic_to_mb(connection.traffic)

        if str(connection.direction).upper() == "INGRESS":
            ingress_mb += traffic_mb
        else:
            egress_mb += traffic_mb

    suspicious_count = sum(
        1
        for connection in connections
        if str(connection.status).upper() == "SUSPICIOUS"
    )

    blocked_count = sum(
        1
        for connection in connections
        if str(connection.status).upper() == "BLOCKED"
    )

    snapshot = NetworkTrafficSnapshot(
        captured_at=datetime.utcnow(),
        ingress_mb=round(ingress_mb, 4),
        egress_mb=round(egress_mb, 4),
        total_connections=len(connections),
        suspicious_connections=suspicious_count,
        blocked_connections=blocked_count,
        source="network_api",
    )

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    return snapshot


def serialize_snapshot(snapshot: NetworkTrafficSnapshot) -> dict:
    """Convert a database snapshot into a JSON-friendly dictionary."""
    return {
        "id": snapshot.id,
        "captured_at": snapshot.captured_at.isoformat(),
        "ingress_mb": snapshot.ingress_mb,
        "egress_mb": snapshot.egress_mb,
        "total_connections": snapshot.total_connections,
        "suspicious_connections": snapshot.suspicious_connections,
        "blocked_connections": snapshot.blocked_connections,
        "source": snapshot.source,
    }


def capture_snapshot_safely():
    """
    Capture a snapshot using a separate database session.

    This function is used by the background task in main.py.
    Errors are logged without crashing the background task.
    """
    try:
        with SessionLocal() as db:
            snapshot = build_snapshot(db)

            logger.info(
                "Network traffic snapshot captured successfully: id=%s",
                snapshot.id,
            )

            return snapshot.id

    except Exception:
        logger.exception(
            "Failed to capture network traffic snapshot."
        )
        return None


@router.post("/traffic/snapshot", status_code=201)
def capture_traffic_snapshot(
    db: Session = Depends(get_db),
):
    """Manually capture a network traffic snapshot."""
    try:
        snapshot = build_snapshot(db)
        return serialize_snapshot(snapshot)

    except Exception as exc:
        db.rollback()

        logger.exception(
            "Unable to capture network traffic snapshot."
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to capture network traffic snapshot.",
        ) from exc


@router.get("/traffic/history")
def get_traffic_history(
    hours: int = Query(default=24, ge=1, le=168),
    limit: int = Query(default=500, ge=1, le=2000),
    db: Session = Depends(get_db),
):
    """Return saved network traffic snapshots for the requested period."""
    cutoff = datetime.utcnow() - timedelta(hours=hours)

    snapshots = db.scalars(
        select(NetworkTrafficSnapshot)
        .where(NetworkTrafficSnapshot.captured_at >= cutoff)
        .order_by(NetworkTrafficSnapshot.captured_at.asc())
        .limit(limit)
    ).all()

    return {
        "hours": hours,
        "total": len(snapshots),
        "history": [
            serialize_snapshot(snapshot)
            for snapshot in snapshots
        ],
    }
