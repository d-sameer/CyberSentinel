from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.policy import Policy
from app.models.policy_action import PolicyAction


router = APIRouter(
    prefix="/api/policies",
    tags=["Policy Actions"],
)


class PolicyActionRequest(BaseModel):
    action: str
    note: Optional[str] = ""
    performed_by: Optional[str] = "GRC Analyst"


ACTION_STATUS_MAP = {
    "START_REVIEW": "UNDER_REVIEW",
    "APPROVE_POLICY": "ACTIVE",
    "RENEW_POLICY": "ACTIVE",
    "RETURN_TO_DRAFT": "DRAFT",
    "EXPIRE_POLICY": "EXPIRED",
}


ACTION_LABELS = {
    "START_REVIEW": "Start Review",
    "APPROVE_POLICY": "Approve Policy",
    "RENEW_POLICY": "Renew Policy",
    "RETURN_TO_DRAFT": "Return to Draft",
    "EXPIRE_POLICY": "Expire Policy",
}


def action_to_dict(action: PolicyAction):
    return {
        "id": action.id,
        "policy_id": action.policy_id,
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


@router.get("/{policy_id}/actions")
def get_policy_actions(
    policy_id: str,
    db: Session = Depends(get_db),
):
    policy = (
        db.query(Policy)
        .filter(Policy.policy_id == policy_id)
        .first()
    )

    if not policy:
        raise HTTPException(
            status_code=404,
            detail="Policy not found",
        )

    actions = (
        db.query(PolicyAction)
        .filter(PolicyAction.policy_id == policy_id)
        .order_by(PolicyAction.created_at.desc())
        .all()
    )

    return {
        "policy_id": policy_id,
        "total_actions": len(actions),
        "actions": [
            action_to_dict(action)
            for action in actions
        ],
    }


@router.post("/{policy_id}/actions")
def perform_policy_action(
    policy_id: str,
    payload: PolicyActionRequest,
    db: Session = Depends(get_db),
):
    policy = (
        db.query(Policy)
        .filter(Policy.policy_id == policy_id)
        .first()
    )

    if not policy:
        raise HTTPException(
            status_code=404,
            detail="Policy not found",
        )

    action = payload.action.upper().strip()

    if action not in ACTION_STATUS_MAP:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Unsupported policy action",
                "supported_actions": list(
                    ACTION_STATUS_MAP.keys()
                ),
            },
        )

    previous_status = policy.status
    new_status = ACTION_STATUS_MAP[action]

    policy.status = new_status
    policy.updated_at = datetime.utcnow()

    policy_action = PolicyAction(
        policy_id=policy.policy_id,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        note=payload.note or "",
        performed_by=payload.performed_by
        or "GRC Analyst",
    )

    db.add(policy_action)
    db.commit()
    db.refresh(policy_action)

    return {
        "message": "Policy action recorded successfully",
        "policy_id": policy.policy_id,
        "action": action,
        "action_label": ACTION_LABELS.get(
            action,
            action.replace("_", " ").title(),
        ),
        "previous_status": previous_status,
        "new_status": new_status,
        "note": policy_action.note,
        "performed_by": policy_action.performed_by,
        "created_at": (
            policy_action.created_at.isoformat()
            if policy_action.created_at
            else None
        ),
    }