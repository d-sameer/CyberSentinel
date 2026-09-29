from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, Integer, String, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.database import Base, get_db


class IdentityAction(Base):
    __tablename__ = "identity_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    action_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    identity_id: Mapped[str] = mapped_column(String(50), index=True)
    action: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(50), index=True)
    analyst: Mapped[str] = mapped_column(String(100), default="SOC Analyst")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class IdentityActionRequest(BaseModel):
    action: str
    analyst: str = "SOC Analyst"


class IdentityActionResponse(BaseModel):
    id: int
    action_id: str
    identity_id: str
    action: str
    status: str
    analyst: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


router = APIRouter(prefix="/api/identity", tags=["Identity Response"])


ALLOWED_ACTIONS = {
    "CREATE_ALERT": "ALERT_CREATED",
    "REVIEW_ACCOUNT": "ACCOUNT_REVIEWED",
    "LOCK_ACCOUNT": "ACCOUNT_LOCK_REQUESTED",
}


@router.get("/{identity_id}/actions", response_model=list[IdentityActionResponse])
def read_identity_actions(identity_id: str, db: Session = Depends(get_db)):
    statement = (
        select(IdentityAction)
        .where(IdentityAction.identity_id == identity_id)
        .order_by(IdentityAction.created_at.desc())
    )
    return db.scalars(statement).all()


@router.post("/{identity_id}/actions", response_model=IdentityActionResponse)
def create_identity_action(
    identity_id: str,
    payload: IdentityActionRequest,
    db: Session = Depends(get_db),
):
    action = payload.action.upper().strip()

    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported identity response action",
        )

    analyst = payload.analyst.strip() or "SOC Analyst"

    record = IdentityAction(
        action_id=f"IAMACT-{uuid4().hex[:8].upper()}",
        identity_id=identity_id,
        action=action,
        status=ALLOWED_ACTIONS[action],
        analyst=analyst,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record
