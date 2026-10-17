
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.network_connection import NetworkConnection
from app.models.network_connection_action import NetworkConnectionAction


router = APIRouter(
    prefix="/api/network",
    tags=["Network Investigation Actions"],
)


class NetworkActionCreate(BaseModel):
    action: str = Field(min_length=1, max_length=100)
    details: str = Field(default="", max_length=10000)
    analyst: str = Field(default="SOC Analyst", min_length=1, max_length=100)


def normalize_connection_id(connection_id: str) -> str:
    return connection_id.strip()


def serialize_action(record: NetworkConnectionAction) -> dict:
    created_at = record.created_at

    if created_at is not None and created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    return {
        "id": record.id,
        "connection_id": record.connection_id,
        "action": record.action,
        "details": record.details or "",
        "analyst": record.analyst,
        "created_at": (
            created_at.isoformat()
            if created_at is not None
            else None
        ),
        "time": (
            created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
            if created_at is not None
            else None
        ),
    }


def get_connection_or_404(
    db: Session,
    connection_id: str,
) -> NetworkConnection:
    normalized_id = normalize_connection_id(connection_id)

    if not normalized_id:
        raise HTTPException(
            status_code=400,
            detail="Connection ID cannot be empty.",
        )

    connection = (
        db.query(NetworkConnection)
        .filter(
            NetworkConnection.connection_id == normalized_id
        )
        .first()
    )

    if connection is None:
        raise HTTPException(
            status_code=404,
            detail=f"Network connection '{normalized_id}' was not found.",
        )

    return connection


@router.get("/{connection_id}/actions")
def get_network_connection_actions(
    connection_id: str,
    db: Session = Depends(get_db),
):
    connection = get_connection_or_404(db, connection_id)

    records = (
        db.query(NetworkConnectionAction)
        .filter(
            NetworkConnectionAction.connection_id
            == connection.connection_id
        )
        .order_by(
            NetworkConnectionAction.created_at.desc(),
            NetworkConnectionAction.id.desc(),
        )
        .all()
    )

    return {
        "connection_id": connection.connection_id,
        "total": len(records),
        "actions": [serialize_action(record) for record in records],
    }


@router.post("/{connection_id}/actions", status_code=201)
def create_network_connection_action(
    connection_id: str,
    payload: NetworkActionCreate,
    db: Session = Depends(get_db),
):
    connection = get_connection_or_404(db, connection_id)

    action_name = payload.action.strip()
    analyst_name = payload.analyst.strip()

    if not action_name:
        raise HTTPException(
            status_code=422,
            detail="Action name cannot be empty.",
        )

    if not analyst_name:
        raise HTTPException(
            status_code=422,
            detail="Analyst name cannot be empty.",
        )

    record = NetworkConnectionAction(
        connection_id=connection.connection_id,
        action=action_name,
        details=payload.details.strip(),
        analyst=analyst_name,
    )

    try:
        db.add(record)
        db.commit()
        db.refresh(record)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save the network investigation action.",
        )

    return {
        "message": "Network investigation action saved successfully.",
        "action": serialize_action(record),
    }
