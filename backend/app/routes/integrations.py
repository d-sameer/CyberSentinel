from datetime import datetime

from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.integration import SecurityIntegration


router = APIRouter(
    prefix="/api/integrations",
    tags=["Security Integrations"],
)


def get_db():
    db = SessionLocal()

    try:
        return db
    except Exception:
        db.close()
        raise


def serialize_integration(integration: SecurityIntegration):
    return {
        "integration_id": integration.integration_id,
        "name": integration.name,
        "description": integration.description,
        "category": integration.category,
        "provider": integration.provider,
        "integration_type": integration.integration_type,
        "status": integration.status,
        "health": integration.health,
        "endpoint": integration.endpoint,
        "owner": integration.owner,
        "data_collected": [
            item.strip()
            for item in integration.data_collected.split("|")
            if item.strip()
        ],
        "sync_frequency": integration.sync_frequency,
        "last_sync": (
            integration.last_sync.isoformat()
            if integration.last_sync
            else None
        ),
        "error_message": integration.error_message,
        "created_at": integration.created_at.isoformat(),
        "updated_at": integration.updated_at.isoformat(),
    }


@router.get("")
def get_integrations():
    db: Session = get_db()

    try:
        integrations = (
            db.query(SecurityIntegration)
            .order_by(SecurityIntegration.id.asc())
            .all()
        )

        total = len(integrations)
        connected = sum(
            1 for item in integrations
            if item.status == "CONNECTED"
        )
        disconnected = sum(
            1 for item in integrations
            if item.status == "DISCONNECTED"
        )
        degraded = sum(
            1 for item in integrations
            if item.status == "DEGRADED"
        )
        disabled = sum(
            1 for item in integrations
            if item.status == "DISABLED"
        )
        healthy = sum(
            1 for item in integrations
            if item.health == "HEALTHY"
        )
        unhealthy = sum(
            1 for item in integrations
            if item.health == "UNHEALTHY"
        )

        return {
            "summary": {
                "total": total,
                "connected": connected,
                "disconnected": disconnected,
                "degraded": degraded,
                "disabled": disabled,
                "healthy": healthy,
                "unhealthy": unhealthy,
            },
            "integrations": [
                serialize_integration(item)
                for item in integrations
            ],
        }

    finally:
        db.close()


@router.get("/{integration_id}")
def get_integration(integration_id: str):
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

        return serialize_integration(integration)

    finally:
        db.close()