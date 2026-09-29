from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, Integer, String, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.database import Base, get_db


class IncidentAction(Base):
    __tablename__ = "incident_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    action_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    incident_id: Mapped[str] = mapped_column(String(50), index=True)
    action: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(50), index=True)
    analyst: Mapped[str] = mapped_column(String(100), default="SOC Analyst")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


class IncidentActionRequest(BaseModel):
    action: str
    analyst: str = "SOC Analyst"


class IncidentActionResponse(BaseModel):
    id: int
    action_id: str
    incident_id: str
    action: str
    status: str
    analyst: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


router = APIRouter(
    prefix="/api/incidents",
    tags=["Incident Response"],
)


ALLOWED_ACTIONS = {
    "CONTAIN_ENDPOINT": "CONTAINED",
    "COLLECT_LIVE_DATA": "LIVE_DATA_COLLECTED",
    "PRESERVE_EVIDENCE": "EVIDENCE_PRESERVED",
    "MARK_RESOLVED": "RESOLVED",
}


@router.get(
    "/{incident_id}/actions",
    response_model=list[IncidentActionResponse],
)
def read_incident_actions(
    incident_id: str,
    db: Session = Depends(get_db),
):
    statement = (
        select(IncidentAction)
        .where(IncidentAction.incident_id == incident_id)
        .order_by(IncidentAction.created_at.desc())
    )

    return db.scalars(statement).all()


@router.post(
    "/{incident_id}/actions",
    response_model=IncidentActionResponse,
)
def create_incident_action(
    incident_id: str,
    payload: IncidentActionRequest,
    db: Session = Depends(get_db),
):
    action = payload.action.upper().strip()

    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported incident response action",
        )

    analyst = payload.analyst.strip() or "SOC Analyst"

    record = IncidentAction(
        action_id=f"IACT-{uuid4().hex[:8].upper()}",
        incident_id=incident_id,
        action=action,
        status=ALLOWED_ACTIONS[action],
        analyst=analyst,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record