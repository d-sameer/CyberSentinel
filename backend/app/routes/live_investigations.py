import hashlib
import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.live_connection_investigation import LiveConnectionInvestigation
from app.models.live_connection_investigation_event import LiveConnectionInvestigationEvent

router = APIRouter(
    prefix="/api/network/live/investigations",
    tags=["Live Connection Investigations"],
)

ALLOWED_STATUSES = {
    "Open",
    "Under Investigation",
    "Resolved",
    "False Positive",
}


class LiveInvestigationInput(BaseModel):
    protocol: str = Field(min_length=1, max_length=20)
    local_ip: str = Field(default="", max_length=100)
    local_port: Optional[int] = None
    remote_ip: str = Field(default="", max_length=100)
    remote_port: Optional[int] = None
    process: str = Field(default="", max_length=255)
    pid: Optional[int] = None
    status: str = "Under Investigation"
    analyst: str = Field(default="SOC Analyst", max_length=100)
    notes: str = Field(default="", max_length=10000)


def create_fingerprint(data: LiveInvestigationInput) -> str:
    identity = {
        "protocol": data.protocol.upper(),
        "local_ip": data.local_ip,
        "local_port": data.local_port,
        "remote_ip": data.remote_ip,
        "remote_port": data.remote_port,
        "process": data.process,
        "pid": data.pid,
    }
    canonical = json.dumps(identity, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def investigation_response(record):
    return {
        "id": record.id,
        "fingerprint": record.fingerprint,
        "protocol": record.protocol,
        "local_ip": record.local_ip,
        "local_port": record.local_port,
        "remote_ip": record.remote_ip,
        "remote_port": record.remote_port,
        "process": record.process,
        "pid": record.pid,
        "status": record.status,
        "analyst": record.analyst,
        "notes": record.notes,
        "created_at": record.created_at,
        "updated_at": record.updated_at,
    }


@router.get("")
def list_live_investigations(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """Return saved live connection investigations, newest first."""
    limit = max(1, min(limit, 500))
    offset = max(0, offset)

    query = db.query(LiveConnectionInvestigation)
    total = query.count()

    records = (
        query
        .order_by(LiveConnectionInvestigation.updated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "investigations": [investigation_response(record) for record in records],
    }

@router.post("/lookup")
def lookup_live_investigation(
    data: LiveInvestigationInput,
    db: Session = Depends(get_db),
):
    fingerprint = create_fingerprint(data)
    record = (
        db.query(LiveConnectionInvestigation)
        .filter(LiveConnectionInvestigation.fingerprint == fingerprint)
        .first()
    )

    if not record:
        return {"found": False, "fingerprint": fingerprint, "investigation": None}

    return {
        "found": True,
        "fingerprint": fingerprint,
        "investigation": investigation_response(record),
    }


@router.get("/{investigation_id}/events")
def list_investigation_events(
    investigation_id: int,
    db: Session = Depends(get_db),
):
    """Return the audit events for one live connection investigation."""
    investigation = (
        db.query(LiveConnectionInvestigation)
        .filter(LiveConnectionInvestigation.id == investigation_id)
        .first()
    )
    if investigation is None:
        raise HTTPException(status_code=404, detail="Investigation not found")

    events = (
        db.query(LiveConnectionInvestigationEvent)
        .filter(LiveConnectionInvestigationEvent.investigation_id == investigation_id)
        .order_by(LiveConnectionInvestigationEvent.created_at.asc(),
                  LiveConnectionInvestigationEvent.id.asc())
        .all()
    )

    return {
        "investigation_id": investigation_id,
        "total": len(events),
        "events": [
            {
                "id": event.id,
                "event_type": event.event_type,
                "previous_status": event.previous_status,
                "new_status": event.new_status,
                "analyst": event.analyst,
                "notes": event.notes,
                "created_at": event.created_at,
            }
            for event in events
        ],
    }


@router.post("")
def save_live_investigation(
    data: LiveInvestigationInput,
    db: Session = Depends(get_db),
):
    if data.status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=422,
            detail=f"Status must be one of: {', '.join(sorted(ALLOWED_STATUSES))}",
        )

    fingerprint = create_fingerprint(data)

    record = (
        db.query(LiveConnectionInvestigation)
        .filter(LiveConnectionInvestigation.fingerprint == fingerprint)
        .first()
    )

    is_new = record is None
    previous_status = record.status if record is not None else None

    if record is None:
        record = LiveConnectionInvestigation(
            fingerprint=fingerprint,
            protocol=data.protocol.upper(),
            local_ip=data.local_ip,
            local_port=data.local_port,
            remote_ip=data.remote_ip,
            remote_port=data.remote_port,
            process=data.process,
            pid=data.pid,
        )
        db.add(record)
        db.flush()

    record.status = data.status
    record.analyst = data.analyst
    record.notes = data.notes
    record.updated_at = datetime.utcnow()

    event = LiveConnectionInvestigationEvent(
        investigation_id=record.id,
        event_type="Created" if is_new else "Updated",
        previous_status=previous_status,
        new_status=data.status,
        analyst=data.analyst,
        notes=data.notes,
    )
    db.add(event)

    try:
        db.commit()
        db.refresh(record)
        db.refresh(event)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not save investigation and audit event")

    return {
        "message": "Investigation and audit event saved successfully",
        "investigation": investigation_response(record),
        "audit_event_id": event.id,
    }