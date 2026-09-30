from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.risk import Risk
from app.models.risk_action import RiskAction


router = APIRouter(
    prefix="/api/risks",
    tags=["Risk Response Actions"],
)


class RiskActionRequest(BaseModel):
    action: str
    note: str = ""
    performed_by: str = "SOC Analyst"


ACTION_STATUS_MAP = {
    "START_TREATMENT": "UNDER_TREATMENT",
    "MARK_MITIGATED": "MITIGATED",
    "ACCEPT_RISK": "ACCEPTED",
    "REOPEN_RISK": "OPEN",
    "START_MONITORING": "MONITORING",
}


ACTION_LABELS = {
    "START_TREATMENT": "Treatment Started",
    "MARK_MITIGATED": "Risk Marked Mitigated",
    "ACCEPT_RISK": "Risk Accepted",
    "REOPEN_RISK": "Risk Reopened",
    "START_MONITORING": "Risk Monitoring Started",
}


def action_to_dict(action: RiskAction) -> dict[str, Any]:
    return {
        "id": action.id,
        "risk_id": action.risk_id,
        "action": action.action,
        "action_label": ACTION_LABELS.get(
            action.action,
            action.action.replace("_", " ").title(),
        ),
        "previous_status": action.previous_status,
        "new_status": action.new_status,
        "note": action.note,
        "performed_by": action.performed_by,
        "created_at": (
            action.created_at.isoformat()
            if action.created_at
            else None
        ),
    }


@router.get("/{risk_id}/actions")
def get_risk_actions(
    risk_id: str,
    db: Session = Depends(get_db),
) -> dict[str, Any]:

    risk = (
        db.query(Risk)
        .filter(Risk.risk_id == risk_id)
        .first()
    )

    if not risk:
        raise HTTPException(
            status_code=404,
            detail="Risk not found",
        )

    actions = (
        db.query(RiskAction)
        .filter(RiskAction.risk_id == risk_id)
        .order_by(RiskAction.created_at.desc())
        .all()
    )

    return {
        "risk_id": risk_id,
        "total_actions": len(actions),
        "actions": [
            action_to_dict(action)
            for action in actions
        ],
    }


@router.post("/{risk_id}/actions")
def create_risk_action(
    risk_id: str,
    payload: RiskActionRequest,
    db: Session = Depends(get_db),
) -> dict[str, Any]:

    risk = (
        db.query(Risk)
        .filter(Risk.risk_id == risk_id)
        .first()
    )

    if not risk:
        raise HTTPException(
            status_code=404,
            detail="Risk not found",
        )

    action = payload.action.strip().upper()

    if action not in ACTION_STATUS_MAP:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported risk action. "
                "Supported actions: "
                + ", ".join(ACTION_STATUS_MAP.keys())
            ),
        )

    previous_status = risk.status
    new_status = ACTION_STATUS_MAP[action]

    risk.status = new_status

    risk.updated_at = datetime.utcnow()

    action_record = RiskAction(
        risk_id=risk.risk_id,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        note=payload.note.strip(),
        performed_by=payload.performed_by.strip()
        or "SOC Analyst",
    )

    db.add(action_record)
    db.commit()
    db.refresh(action_record)

    return {
        "message": "Risk response action recorded",
        "risk": {
            "risk_id": risk.risk_id,
            "status": risk.status,
            "updated_at": (
                risk.updated_at.isoformat()
                if risk.updated_at
                else None
            ),
        },
        "action": action_to_dict(action_record),
    }