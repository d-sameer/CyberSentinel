from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, Integer, String, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.database import Base, get_db


class SOCEventAction(Base):
    __tablename__ = "soc_event_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    action_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    event_id: Mapped[str] = mapped_column(String(50), index=True)
    action: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(50), index=True)
    analyst: Mapped[str] = mapped_column(String(100), default="SOC Analyst")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ResponseActionRequest(BaseModel):
    action: str
    analyst: str = "SOC Analyst"


class ResponseActionResponse(BaseModel):
    id: int
    action_id: str
    event_id: str
    action: str
    status: str
    analyst: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


router = APIRouter(prefix="/api/events", tags=["SOC Event Response"])

ALLOWED_ACTIONS = {
    "MARK_REVIEWED": "REVIEWED",
    "ESCALATE": "ESCALATED",
    "ISOLATE_ASSET": "ISOLATION_REQUESTED",
}


@router.get("/{event_id}/actions", response_model=list[ResponseActionResponse])
def read_response_actions(
    event_id: str,
    db: Session = Depends(get_db),
):
    statement = (
        select(SOCEventAction)
        .where(SOCEventAction.event_id == event_id)
        .order_by(SOCEventAction.created_at.desc())
    )
    return db.scalars(statement).all()


@router.post("/{event_id}/actions", response_model=ResponseActionResponse)
def create_response_action(
    event_id: str,
    payload: ResponseActionRequest,
    db: Session = Depends(get_db),
):
    action = payload.action.upper().strip()

    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported response action",
        )

    analyst = payload.analyst.strip() or "SOC Analyst"

    record = SOCEventAction(
        action_id=f"ACT-{uuid4().hex[:8].upper()}",
        event_id=event_id,
        action=action,
        status=ALLOWED_ACTIONS[action],
        analyst=analyst,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record
