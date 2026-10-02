from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.integration import SecurityIntegration
from app.models.integration_action import SecurityIntegrationAction


router = APIRouter(
    prefix="/api/integrations",
    tags=["Security Integration Actions"],
)


class IntegrationActionRequest(BaseModel):
    note: str = ""


ALLOWED_ACTIONS = {
    "TEST_CONNECTION",
    "ENABLE_INTEGRATION",
    "DISABLE_INTEGRATION",
    "RECONNECT_INTEGRATION",
}


def get_db():
    return SessionLocal()


def serialize_action(action: SecurityIntegrationAction):
    return {
        "action_id": action.action_id,
        "integration_id": action.integration_id,
        "action": action.action,
        "previous_status": action.previous_status,
        "new_status": action.new_status,
        "previous_health": action.previous_health,
        "new_health": action.new_health,
        "actor": action.actor,
        "note": action.note,
        "result": action.result,
        "created_at": action.created_at.isoformat(),
    }


@router.post("/{integration_id}/actions")
def perform_integration_action(
    integration_id: str,
    action: str,
    request: IntegrationActionRequest,
):
    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported integration action.",
        )

    db: Session = get_db()

    try:
        integration = (
            db.query(SecurityIntegration)
            .filter(
                SecurityIntegration.integration_id
                == integration_id
            )
            .first()
        )

        if not integration:
            raise HTTPException(
                status_code=404,
                detail="Security integration not found.",
            )

        previous_status = integration.status
        previous_health = integration.health

        if action == "TEST_CONNECTION":
            if integration.status == "DISABLED":
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Connection testing is unavailable "
                        "while the integration is disabled."
                    ),
                )

            integration.status = "CONNECTED"
            integration.health = "HEALTHY"
            integration.last_sync = datetime.utcnow()
            integration.error_message = ""

            result = (
                "Connection test completed successfully. "
                "The simulated integration endpoint responded "
                "normally."
            )

        elif action == "ENABLE_INTEGRATION":
            if integration.status != "DISABLED":
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Only disabled integrations can be enabled."
                    ),
                )

            integration.status = "CONNECTED"
            integration.health = "HEALTHY"
            integration.last_sync = datetime.utcnow()
            integration.error_message = ""

            result = (
                "Integration enabled successfully. "
                "Simulated synchronization is now active."
            )

        elif action == "DISABLE_INTEGRATION":
            if integration.status == "DISABLED":
                raise HTTPException(
                    status_code=400,
                    detail="Integration is already disabled.",
                )

            integration.status = "DISABLED"
            integration.health = "UNHEALTHY"

            result = (
                "Integration disabled successfully. "
                "Simulated synchronization has been stopped."
            )

        else:
            if integration.status == "DISABLED":
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Disabled integrations must be enabled "
                        "before they can be reconnected."
                    ),
                )

            integration.status = "CONNECTED"
            integration.health = "HEALTHY"
            integration.last_sync = datetime.utcnow()
            integration.error_message = ""

            result = (
                "Integration reconnect completed successfully. "
                "The simulated connection is healthy."
            )

        integration.updated_at = datetime.utcnow()

        latest_action = (
            db.query(SecurityIntegrationAction)
            .order_by(SecurityIntegrationAction.id.desc())
            .first()
        )

        next_number = (
            latest_action.id + 1
            if latest_action
            else 1
        )

        action_id = f"INTA-{next_number:04d}"

        action_record = SecurityIntegrationAction(
            action_id=action_id,
            integration_id=integration.integration_id,
            action=action,
            previous_status=previous_status,
            new_status=integration.status,
            previous_health=previous_health,
            new_health=integration.health,
            actor="Security Admin",
            note=request.note.strip(),
            result=result,
        )

        db.add(action_record)
        db.commit()
        db.refresh(integration)
        db.refresh(action_record)

        return {
            "message": result,
            "integration": {
                "integration_id": integration.integration_id,
                "status": integration.status,
                "health": integration.health,
                "last_sync": (
                    integration.last_sync.isoformat()
                    if integration.last_sync
                    else None
                ),
                "error_message": integration.error_message,
                "updated_at": integration.updated_at.isoformat(),
            },
            "action": serialize_action(action_record),
        }

    finally:
        db.close()


@router.get("/{integration_id}/actions")
def get_integration_actions(integration_id: str):
    db: Session = get_db()

    try:
        integration = (
            db.query(SecurityIntegration)
            .filter(
                SecurityIntegration.integration_id
                == integration_id
            )
            .first()
        )

        if not integration:
            raise HTTPException(
                status_code=404,
                detail="Security integration not found.",
            )

        actions = (
            db.query(SecurityIntegrationAction)
            .filter(
                SecurityIntegrationAction.integration_id
                == integration_id
            )
            .order_by(SecurityIntegrationAction.id.desc())
            .all()
        )

        return {
            "integration_id": integration_id,
            "total": len(actions),
            "actions": [
                serialize_action(item)
                for item in actions
            ],
        }

    finally:
        db.close()