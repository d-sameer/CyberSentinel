from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, Integer, String, Text, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.database import Base, get_db


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(20), index=True)
    status: Mapped[str] = mapped_column(String(30), index=True, default="OPEN")
    analyst: Mapped[str] = mapped_column(String(100), default="SOC Analyst")
    primary_asset: Mapped[str] = mapped_column(String(100))
    related_event_ids: Mapped[str] = mapped_column(Text, default="")
    related_alert_ids: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class IncidentResponse(BaseModel):
    id: int
    incident_id: str
    title: str
    description: str
    severity: str
    status: str
    analyst: str
    primary_asset: str
    related_event_ids: list[str]
    related_alert_ids: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IncidentStatusUpdate(BaseModel):
    status: str
    analyst: str = "SOC Analyst"


router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

ALLOWED_STATUSES = {
    "OPEN",
    "INVESTIGATING",
    "CONTAINED",
    "RESOLVED",
}


SEED_INCIDENTS = [
    {
        "incident_id": "INC-003",
        "title": "Suspicious outbound PowerShell activity",
        "description": "Critical network activity involving PowerShell execution and an external HTTPS destination.",
        "severity": "CRITICAL",
        "status": "INVESTIGATING",
        "analyst": "SOC Analyst",
        "primary_asset": "WIN-01",
        "related_event_ids": "EVT-1048",
        "related_alert_ids": "ALT-018",
    },
    {
        "incident_id": "INC-001",
        "title": "PowerShell execution policy bypass",
        "description": "High-severity endpoint activity associated with a PowerShell execution policy bypass.",
        "severity": "HIGH",
        "status": "OPEN",
        "analyst": "SOC Analyst",
        "primary_asset": "WIN-02",
        "related_event_ids": "EVT-1047",
        "related_alert_ids": "ALT-021",
    },
    {
        "incident_id": "INC-002",
        "title": "Repeated RDP authentication failures",
        "description": "Multiple authentication failures were detected against an RDP service.",
        "severity": "MEDIUM",
        "status": "CONTAINED",
        "analyst": "SOC Analyst",
        "primary_asset": "WIN-02",
        "related_event_ids": "EVT-1046",
        "related_alert_ids": "ALT-007",
    },
    {
        "incident_id": "INC-006",
        "title": "Unsigned executable execution",
        "description": "An unsigned executable was observed executing from a non-standard location.",
        "severity": "HIGH",
        "status": "INVESTIGATING",
        "analyst": "SOC Analyst",
        "primary_asset": "WIN-04",
        "related_event_ids": "EVT-1045",
        "related_alert_ids": "ALT-031",
    },
    {
        "incident_id": "INC-007",
        "title": "Security file deletion attempt",
        "description": "A security-related file deletion attempt was detected and blocked.",
        "severity": "HIGH",
        "status": "CONTAINED",
        "analyst": "SOC Analyst",
        "primary_asset": "WIN-02",
        "related_event_ids": "EVT-1043",
        "related_alert_ids": "ALT-034",
    },
    {
        "incident_id": "INC-008",
        "title": "Administrative group membership change",
        "description": "A new administrative group membership was detected and requires review.",
        "severity": "MEDIUM",
        "status": "OPEN",
        "analyst": "SOC Analyst",
        "primary_asset": "WIN-03",
        "related_event_ids": "EVT-1042",
        "related_alert_ids": "ALT-037",
    },
]


def _split_ids(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def _serialize(incident: Incident) -> dict:
    return {
        "id": incident.id,
        "incident_id": incident.incident_id,
        "title": incident.title,
        "description": incident.description,
        "severity": incident.severity,
        "status": incident.status,
        "analyst": incident.analyst,
        "primary_asset": incident.primary_asset,
        "related_event_ids": _split_ids(incident.related_event_ids),
        "related_alert_ids": _split_ids(incident.related_alert_ids),
        "created_at": incident.created_at,
        "updated_at": incident.updated_at,
    }


def seed_incidents(db: Session) -> None:
    existing = db.scalars(select(Incident.incident_id)).all()
    existing_ids = set(existing)

    created = False

    for item in SEED_INCIDENTS:
        if item["incident_id"] in existing_ids:
            continue

        db.add(Incident(**item))
        created = True

    if created:
        db.commit()


@router.get("", response_model=list[IncidentResponse])
def read_incidents(db: Session = Depends(get_db)):
    seed_incidents(db)

    statement = select(Incident).order_by(Incident.updated_at.desc())
    incidents = db.scalars(statement).all()

    return [_serialize(incident) for incident in incidents]


@router.get("/{incident_id}", response_model=IncidentResponse)
def read_incident(incident_id: str, db: Session = Depends(get_db)):
    seed_incidents(db)

    incident = db.scalar(
        select(Incident).where(Incident.incident_id == incident_id)
    )

    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    return _serialize(incident)


@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: str,
    payload: IncidentStatusUpdate,
    db: Session = Depends(get_db),
):
    status = payload.status.upper().strip()

    if status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported incident status. Allowed: {sorted(ALLOWED_STATUSES)}",
        )

    incident = db.scalar(
        select(Incident).where(Incident.incident_id == incident_id)
    )

    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = status
    incident.analyst = payload.analyst.strip() or "SOC Analyst"
    incident.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(incident)

    return _serialize(incident)
