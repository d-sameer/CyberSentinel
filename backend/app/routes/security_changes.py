from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.security_change import SecurityChange


router = APIRouter(
    prefix="/api/security-changes",
    tags=["Security Changes"],
)


def split_values(value: str) -> list[str]:
    if not value:
        return []

    return [
        item.strip()
        for item in value.split("|")
        if item.strip()
    ]


def serialize_change(change: SecurityChange) -> dict:
    return {
        "id": change.id,
        "change_id": change.change_id,
        "title": change.title,
        "description": change.description,
        "change_type": change.change_type,
        "category": change.category,
        "priority": change.priority,
        "risk_level": change.risk_level,
        "status": change.status,
        "approval_status": change.approval_status,
        "implementation_status": change.implementation_status,
        "environment": change.environment,
        "asset_id": change.asset_id,
        "asset_name": change.asset_name,
        "requester": change.requester,
        "owner": change.owner,
        "business_impact": change.business_impact,
        "security_impact": change.security_impact,
        "implementation_plan": change.implementation_plan,
        "validation_plan": change.validation_plan,
        "rollback_plan": change.rollback_plan,
        "scheduled_start": change.scheduled_start,
        "scheduled_end": change.scheduled_end,
        "related_configuration_ids": split_values(
            change.related_configuration_ids
        ),
        "related_incident_ids": split_values(
            change.related_incident_ids
        ),
        "related_vulnerability_ids": split_values(
            change.related_vulnerability_ids
        ),
        "related_alert_ids": split_values(
            change.related_alert_ids
        ),
        "created_at": change.created_at,
        "updated_at": change.updated_at,
    }


@router.get("")
def get_security_changes(
    db: Session = Depends(get_db),
):
    changes = (
        db.query(SecurityChange)
        .order_by(SecurityChange.created_at.desc())
        .all()
    )

    total = len(changes)

    approved = sum(
        1
        for change in changes
        if change.approval_status.upper() == "APPROVED"
    )

    pending_approval = sum(
        1
        for change in changes
        if change.approval_status.upper() == "PENDING"
    )

    rejected = sum(
        1
        for change in changes
        if change.approval_status.upper() == "REJECTED"
    )

    completed = sum(
        1
        for change in changes
        if change.status.upper() == "COMPLETED"
    )

    in_progress = sum(
        1
        for change in changes
        if change.status.upper() == "IN_PROGRESS"
    )

    planned = sum(
        1
        for change in changes
        if change.status.upper() == "PLANNED"
    )

    failed = sum(
        1
        for change in changes
        if change.status.upper() == "FAILED"
    )

    rolled_back = sum(
        1
        for change in changes
        if change.status.upper() == "ROLLED_BACK"
    )

    critical = sum(
        1
        for change in changes
        if change.risk_level.upper() == "CRITICAL"
    )

    high = sum(
        1
        for change in changes
        if change.risk_level.upper() == "HIGH"
    )

    medium = sum(
        1
        for change in changes
        if change.risk_level.upper() == "MEDIUM"
    )

    low = sum(
        1
        for change in changes
        if change.risk_level.upper() == "LOW"
    )

    return {
        "summary": {
            "total": total,
            "approved": approved,
            "pending_approval": pending_approval,
            "rejected": rejected,
            "completed": completed,
            "in_progress": in_progress,
            "planned": planned,
            "failed": failed,
            "rolled_back": rolled_back,
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
        },
        "changes": [
            serialize_change(change)
            for change in changes
        ],
    }


@router.get("/{change_id}")
def get_security_change(
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

    return serialize_change(change)