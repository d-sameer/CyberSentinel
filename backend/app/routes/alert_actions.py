from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, Integer, String, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.database import Base, get_db
from app.models.alert import Alert


class AlertAction(Base):
    __tablename__ = "alert_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    action_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    alert_id: Mapped[str] = mapped_column(String(50), index=True)
    action: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(50), index=True)
    analyst: Mapped[str] = mapped_column(String(100), default="SOC Analyst")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


class AlertActionRequest(BaseModel):
    action: str
    analyst: str = "SOC Analyst"


class AlertActionResponse(BaseModel):
    id: int
    action_id: str
    alert_id: str
    action: str
    status: str
    analyst: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


router = APIRouter(
    prefix="/api/alerts",
    tags=["Alert Response"],
)

ALLOWED_ACTIONS = {
    "INVESTIGATE": "INVESTIGATING",
    "MARK_REVIEWED": "REVIEWED",
    "OPEN_RELATED_CONTEXT": "CONTEXT_OPENED",
}


@router.get(
    "/{alert_id}/actions",
    response_model=list[AlertActionResponse],
)
def read_alert_actions(
    alert_id: str,
    db: Session = Depends(get_db),
):
    statement = (
        select(AlertAction)
        .where(AlertAction.alert_id == alert_id)
        .order_by(AlertAction.created_at.desc())
    )

    return db.scalars(statement).all()


@router.post(
    "/{alert_id}/actions",
    response_model=AlertActionResponse,
)
def create_alert_action(
    alert_id: str,
    payload: AlertActionRequest,
    db: Session = Depends(get_db),
):
    action = payload.action.upper().strip()

    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported alert response action",
        )

    alert = db.scalar(
        select(Alert).where(Alert.alert_id == alert_id)
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    analyst = payload.analyst.strip() or "SOC Analyst"

    record = AlertAction(
        action_id=f"ALACT-{uuid4().hex[:8].upper()}",
        alert_id=alert_id,
        action=action,
        status=ALLOWED_ACTIONS[action],
        analyst=analyst,
    )

    db.add(record)

    if action == "INVESTIGATE":
        alert.status = "INVESTIGATING"
    elif action == "MARK_REVIEWED":
        alert.status = "REVIEWED"

    db.commit()
    db.refresh(record)

    return record
