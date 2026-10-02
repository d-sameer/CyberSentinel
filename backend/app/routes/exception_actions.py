from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.exception import SecurityException
from app.models.exception_action import SecurityExceptionAction


router = APIRouter(
    prefix="/api/exceptions",
    tags=["Security Exception Actions"],
)


class ExceptionActionRequest(BaseModel):
    action: str
    note: str = ""
    actor: str = "Security Admin"
    expiry_date: Optional[date] = None


ACTION_STATUS_MAP = {
    "START_REVIEW": "UNDER_REVIEW",
    "APPROVE_EXCEPTION": "APPROVED",
    "REJECT_EXCEPTION": "REJECTED",
    "REVOKE_EXCEPTION": "REVOKED",
    "EXPIRE_EXCEPTION": "EXPIRED",
    "RENEW_EXCEPTION": "APPROVED",
}


ALLOWED_ACTIONS = set(ACTION_STATUS_MAP.keys())


def action_to_dict(action: SecurityExceptionAction):
    return {
        "action_id": action.action_id,
        "exception_id": action.exception_id,
        "action": action.action,
        "previous_status": action.previous_status,
        "new_status": action.new_status,
        "actor": action.actor,
        "note": action.note,
        "created_at": (
            action.created_at.isoformat()
            if action.created_at
            else None
        ),
    }


def generate_action_id(db: Session):
    count = (
        db.query(SecurityExceptionAction)
        .count()
    )

    return f"EXA-{count + 1:04d}"


@router.get("/{exception_id}/actions")
def get_exception_actions(
    exception_id: str,
    db: Session = Depends(get_db),
):
    exception = (
        db.query(SecurityException)
        .filter(
            SecurityException.exception_id
            == exception_id
        )
        .first()
    )

    if not exception:
        raise HTTPException(
            status_code=404,
            detail="Security exception not found",
        )

    actions = (
        db.query(SecurityExceptionAction)
        .filter(
            SecurityExceptionAction.exception_id
            == exception_id
        )
        .order_by(
            SecurityExceptionAction.created_at.desc()
        )
        .all()
    )

    return {
        "exception_id": exception_id,
        "current_status": exception.status,
        "actions": [
            action_to_dict(item)
            for item in actions
        ],
    }


@router.post("/{exception_id}/actions")
def create_exception_action(
    exception_id: str,
    payload: ExceptionActionRequest,
    db: Session = Depends(get_db),
):
    exception = (
        db.query(SecurityException)
        .filter(
            SecurityException.exception_id
            == exception_id
        )
        .first()
    )

    if not exception:
        raise HTTPException(
            status_code=404,
            detail="Security exception not found",
        )

    action = payload.action.strip().upper()

    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported exception action. "
                "Allowed actions: "
                + ", ".join(sorted(ALLOWED_ACTIONS))
            ),
        )

    previous_status = exception.status
    new_status = ACTION_STATUS_MAP[action]

    if action == "START_REVIEW":
        if exception.status not in {
            "REQUESTED",
            "APPROVED",
        }:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Only requested or approved "
                    "exceptions can be moved to review."
                ),
            )

    elif action == "APPROVE_EXCEPTION":
        if exception.status not in {
            "REQUESTED",
            "UNDER_REVIEW",
        }:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Only requested or under-review "
                    "exceptions can be approved."
                ),
            )

    elif action == "REJECT_EXCEPTION":
        if exception.status not in {
            "REQUESTED",
            "UNDER_REVIEW",
        }:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Only requested or under-review "
                    "exceptions can be rejected."
                ),
            )

    elif action == "REVOKE_EXCEPTION":
        if exception.status != "APPROVED":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Only approved exceptions can "
                    "be revoked."
                ),
            )

    elif action == "EXPIRE_EXCEPTION":
        if exception.status not in {
            "APPROVED",
            "UNDER_REVIEW",
        }:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Only approved or under-review "
                    "exceptions can be expired."
                ),
            )

    elif action == "RENEW_EXCEPTION":
        if exception.status not in {
            "APPROVED",
            "EXPIRED",
            "REVOKED",
        }:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Only approved, expired, or "
                    "revoked exceptions can be renewed."
                ),
            )

        if not payload.expiry_date:
            raise HTTPException(
                status_code=400,
                detail=(
                    "A new expiry date is required "
                    "when renewing an exception."
                ),
            )

        if payload.expiry_date <= date.today():
            raise HTTPException(
                status_code=400,
                detail=(
                    "The new expiry date must be "
                    "in the future."
                ),
            )

        exception.expiry_date = payload.expiry_date

    exception.status = new_status

    action_record = SecurityExceptionAction(
        action_id=generate_action_id(db),
        exception_id=exception.exception_id,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        actor=payload.actor.strip()
        or "Security Admin",
        note=payload.note.strip(),
    )

    db.add(action_record)
    db.commit()

    db.refresh(exception)
    db.refresh(action_record)

    return {
        "message": "Security exception action recorded",
        "exception": {
            "exception_id": exception.exception_id,
            "status": exception.status,
            "expiry_date": (
                exception.expiry_date.isoformat()
                if exception.expiry_date
                else None
            ),
        },
        "action": action_to_dict(
            action_record
        ),
    }