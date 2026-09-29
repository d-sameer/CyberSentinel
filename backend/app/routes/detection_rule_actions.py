from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, Integer, String, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.database import Base, get_db


class DetectionRuleState(Base):
    __tablename__ = "detection_rule_states"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rule_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(20), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DetectionRuleAction(Base):
    __tablename__ = "detection_rule_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    action_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    rule_id: Mapped[str] = mapped_column(String(50), index=True)
    action: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(50), index=True)
    analyst: Mapped[str] = mapped_column(String(100), default="SOC Analyst")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DetectionRuleActionRequest(BaseModel):
    action: str
    analyst: str = "SOC Analyst"


class DetectionRuleStateResponse(BaseModel):
    rule_id: str
    status: str
    source: str


class DetectionRuleActionResponse(BaseModel):
    id: int
    action_id: str
    rule_id: str
    action: str
    status: str
    analyst: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


router = APIRouter(prefix="/api/detection-rule-actions", tags=["Detection Rule Response"])

VALID_RULES = {f"DET-{index:03d}" for index in range(1, 11)}

DEFAULT_STATUSES = {
    "DET-001": "ENABLED",
    "DET-002": "ENABLED",
    "DET-003": "ENABLED",
    "DET-004": "ENABLED",
    "DET-005": "ENABLED",
    "DET-006": "ENABLED",
    "DET-007": "ENABLED",
    "DET-008": "ENABLED",
    "DET-009": "DISABLED",
    "DET-010": "ENABLED",
}

ALLOWED_ACTIONS = {
    "ENABLE_RULE": "RULE_ENABLED",
    "DISABLE_RULE": "RULE_DISABLED",
    "TEST_RULE": "RULE_TESTED",
    "REVIEW_RULE": "RULE_REVIEWED",
}


def validate_rule(rule_id: str) -> str:
    normalized = rule_id.upper().strip()
    if normalized not in VALID_RULES:
        raise HTTPException(status_code=404, detail="Detection rule not found")
    return normalized


def get_or_create_state(rule_id: str, db: Session) -> DetectionRuleState:
    state = db.scalar(
        select(DetectionRuleState).where(DetectionRuleState.rule_id == rule_id)
    )
    if state is not None:
        return state

    state = DetectionRuleState(
        rule_id=rule_id,
        status=DEFAULT_STATUSES.get(rule_id, "ENABLED"),
    )
    db.add(state)
    db.commit()
    db.refresh(state)
    return state


@router.get("/{rule_id}/state", response_model=DetectionRuleStateResponse)
def read_rule_state(rule_id: str, db: Session = Depends(get_db)):
    normalized = validate_rule(rule_id)
    state = get_or_create_state(normalized, db)
    return {
        "rule_id": normalized,
        "status": state.status,
        "source": "CyberSentinel API",
    }


@router.get("/{rule_id}/actions", response_model=list[DetectionRuleActionResponse])
def read_rule_actions(rule_id: str, db: Session = Depends(get_db)):
    normalized = validate_rule(rule_id)
    statement = (
        select(DetectionRuleAction)
        .where(DetectionRuleAction.rule_id == normalized)
        .order_by(DetectionRuleAction.created_at.desc())
    )
    return db.scalars(statement).all()


@router.post("/{rule_id}/actions", response_model=DetectionRuleActionResponse)
def create_rule_action(
    rule_id: str,
    payload: DetectionRuleActionRequest,
    db: Session = Depends(get_db),
):
    normalized = validate_rule(rule_id)
    action = payload.action.upper().strip()

    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported detection rule response action",
        )

    analyst = payload.analyst.strip() or "SOC Analyst"
    state = get_or_create_state(normalized, db)

    if action == "ENABLE_RULE":
        state.status = "ENABLED"
    elif action == "DISABLE_RULE":
        state.status = "DISABLED"

    state.updated_at = datetime.utcnow()

    record = DetectionRuleAction(
        action_id=f"DETACT-{uuid4().hex[:8].upper()}",
        rule_id=normalized,
        action=action,
        status=ALLOWED_ACTIONS[action],
        analyst=analyst,
    )

    db.add(record)
    db.commit()
    db.refresh(record)
    return record
