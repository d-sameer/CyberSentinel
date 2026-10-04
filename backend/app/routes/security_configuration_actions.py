from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.security_configuration import SecurityConfiguration
from app.models.security_configuration_action import (
    SecurityConfigurationAction,
)


router = APIRouter(
    prefix="/api/security-configurations",
    tags=["Security Configuration Actions"],
)


class SecurityConfigurationActionRequest(BaseModel):
    action: str
    performed_by: str = "Security Analyst"
    notes: str = ""


def serialize_action(
    action: SecurityConfigurationAction,
) -> dict:
    return {
        "id": action.id,
        "configuration_id": action.configuration_id,
        "action": action.action,
        "status": action.status,
        "performed_by": action.performed_by,
        "notes": action.notes,
        "created_at": action.created_at,
    }


@router.get("/{configuration_id}/actions")
def get_configuration_actions(
    configuration_id: str,
    db: Session = Depends(get_db),
):
    configuration = (
        db.query(SecurityConfiguration)
        .filter(
            SecurityConfiguration.configuration_id
            == configuration_id
        )
        .first()
    )

    if not configuration:
        raise HTTPException(
            status_code=404,
            detail="Security configuration not found",
        )

    actions = (
        db.query(SecurityConfigurationAction)
        .filter(
            SecurityConfigurationAction.configuration_id
            == configuration_id
        )
        .order_by(
            SecurityConfigurationAction.created_at.desc()
        )
        .all()
    )

    return {
        "configuration_id": configuration_id,
        "actions": [
            serialize_action(action)
            for action in actions
        ],
    }


@router.post("/{configuration_id}/actions")
def create_configuration_action(
    configuration_id: str,
    request: SecurityConfigurationActionRequest,
    db: Session = Depends(get_db),
):
    configuration = (
        db.query(SecurityConfiguration)
        .filter(
            SecurityConfiguration.configuration_id
            == configuration_id
        )
        .first()
    )

    if not configuration:
        raise HTTPException(
            status_code=404,
            detail="Security configuration not found",
        )

    allowed_actions = {
        "REMEDIATE",
        "MARK_COMPLIANT",
        "ACCEPT_RISK",
        "SCHEDULE_REVIEW",
        "RECHECK",
    }

    action_name = request.action.strip().upper()

    if action_name not in allowed_actions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid action. Allowed actions: "
                "REMEDIATE, MARK_COMPLIANT, ACCEPT_RISK, "
                "SCHEDULE_REVIEW, RECHECK"
            ),
        )

    if action_name == "MARK_COMPLIANT":
        configuration.compliance_status = "COMPLIANT"

    elif action_name == "REMEDIATE":
        configuration.compliance_status = "COMPLIANT"

    elif action_name == "ACCEPT_RISK":
        configuration.compliance_status = "PARTIALLY_COMPLIANT"

    elif action_name == "RECHECK":
        configuration.last_checked = datetime.utcnow()

    configuration.updated_at = datetime.utcnow()

    action = SecurityConfigurationAction(
        configuration_id=configuration_id,
        action=action_name,
        status="COMPLETED",
        performed_by=request.performed_by.strip()
        or "Security Analyst",
        notes=request.notes.strip(),
        created_at=datetime.utcnow(),
    )

    db.add(action)
    db.commit()
    db.refresh(action)

    return {
        "message": "Security configuration action completed",
        "configuration": {
            "configuration_id": configuration.configuration_id,
            "compliance_status": configuration.compliance_status,
            "last_checked": configuration.last_checked,
            "updated_at": configuration.updated_at,
        },
        "action": serialize_action(action),
    }