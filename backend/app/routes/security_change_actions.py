from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.security_change import SecurityChange
from app.models.security_change_action import SecurityChangeAction


router = APIRouter(
    prefix="/api/security-changes",
    tags=["Security Change Actions"],
)


class SecurityChangeActionRequest(BaseModel):
    action: str
    performed_by: str = "Security Analyst"
    notes: str = ""


def serialize_action(
    action: SecurityChangeAction,
) -> dict:
    return {
        "id": action.id,
        "change_id": action.change_id,
        "action": action.action,
        "status": action.status,
        "performed_by": action.performed_by,
        "notes": action.notes,
        "created_at": action.created_at,
    }


@router.get("/{change_id}/actions")
def get_change_actions(
    change_id: str,
    db: Session = Depends(get_db),
):
    change = (
        db.query(SecurityChange)
        .filter(
            SecurityChange.change_id == change_id
        )
        .first()
    )

    if not change:
        raise HTTPException(
            status_code=404,
            detail="Security change not found",
        )

    actions = (
        db.query(SecurityChangeAction)
        .filter(
            SecurityChangeAction.change_id == change_id
        )
        .order_by(
            SecurityChangeAction.created_at.desc()
        )
        .all()
    )

    return {
        "change_id": change_id,
        "actions": [
            serialize_action(action)
            for action in actions
        ],
    }


@router.post("/{change_id}/actions")
def create_change_action(
    change_id: str,
    request: SecurityChangeActionRequest,
    db: Session = Depends(get_db),
):
    change = (
        db.query(SecurityChange)
        .filter(
            SecurityChange.change_id == change_id
        )
        .first()
    )

    if not change:
        raise HTTPException(
            status_code=404,
            detail="Security change not found",
        )

    allowed_actions = {
        "APPROVE",
        "REJECT",
        "START_IMPLEMENTATION",
        "VALIDATE",
        "COMPLETE",
        "ROLLBACK",
        "CANCEL",
    }

    action_name = request.action.strip().upper()

    if action_name not in allowed_actions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid action. Allowed actions: "
                "APPROVE, REJECT, "
                "START_IMPLEMENTATION, VALIDATE, "
                "COMPLETE, ROLLBACK, CANCEL"
            ),
        )

    # -----------------------------------------
    # Approval workflow
    # -----------------------------------------

    if action_name == "APPROVE":
        change.approval_status = "APPROVED"

        if change.status == "PLANNED":
            change.implementation_status = "PLANNED"

    elif action_name == "REJECT":
        change.approval_status = "REJECTED"

    # -----------------------------------------
    # Implementation workflow
    # -----------------------------------------

    elif action_name == "START_IMPLEMENTATION":
        if change.approval_status != "APPROVED":
            raise HTTPException(
                status_code=400,
                detail=(
                    "The security change must be approved "
                    "before implementation can start."
                ),
            )

        change.status = "IN_PROGRESS"
        change.implementation_status = "IN_PROGRESS"

    elif action_name == "VALIDATE":
        if change.status not in {
            "IN_PROGRESS",
            "COMPLETED",
        }:
            raise HTTPException(
                status_code=400,
                detail=(
                    "The change must be in progress or "
                    "completed before validation."
                ),
            )

    elif action_name == "COMPLETE":
        if change.approval_status != "APPROVED":
            raise HTTPException(
                status_code=400,
                detail=(
                    "The security change must be approved "
                    "before it can be completed."
                ),
            )

        change.status = "COMPLETED"
        change.implementation_status = "COMPLETED"

    # -----------------------------------------
    # Rollback workflow
    # -----------------------------------------

    elif action_name == "ROLLBACK":
        change.status = "ROLLED_BACK"
        change.implementation_status = "ROLLED_BACK"

    # -----------------------------------------
    # Cancellation workflow
    # -----------------------------------------

    elif action_name == "CANCEL":
        change.status = "CANCELLED"

    change.updated_at = datetime.utcnow()

    action = SecurityChangeAction(
        change_id=change_id,
        action=action_name,
        status="COMPLETED",
        performed_by=(
            request.performed_by.strip()
            or "Security Analyst"
        ),
        notes=request.notes.strip(),
        created_at=datetime.utcnow(),
    )

    db.add(action)
    db.commit()
    db.refresh(action)

    return {
        "message": (
            "Security change action completed"
        ),
        "change": {
            "change_id": change.change_id,
            "status": change.status,
            "approval_status": change.approval_status,
            "implementation_status": (
                change.implementation_status
            ),
            "updated_at": change.updated_at,
        },
        "action": serialize_action(action),
    }