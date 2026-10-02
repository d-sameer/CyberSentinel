from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.playbook import SecurityPlaybook


router = APIRouter(
    prefix="/api/playbooks",
    tags=["Security Playbooks"],
)


def split_actions(value: Optional[str]):
    if not value:
        return []

    return [
        item.strip()
        for item in value.split("|")
        if item.strip()
    ]


def playbook_to_dict(playbook: SecurityPlaybook):
    return {
        "playbook_id": playbook.playbook_id,
        "name": playbook.name,
        "description": playbook.description,
        "category": playbook.category,
        "severity": playbook.severity,
        "status": playbook.status,
        "trigger_type": playbook.trigger_type,
        "target_type": playbook.target_type,
        "actions": split_actions(playbook.actions),
        "owner": playbook.owner,
        "version": playbook.version,
        "created_at": (
            playbook.created_at.isoformat()
            if playbook.created_at
            else None
        ),
        "updated_at": (
            playbook.updated_at.isoformat()
            if playbook.updated_at
            else None
        ),
    }


@router.get("")
def get_playbooks(
    db: Session = Depends(get_db),
):
    playbooks = (
        db.query(SecurityPlaybook)
        .order_by(
            SecurityPlaybook.severity.asc(),
            SecurityPlaybook.id.asc(),
        )
        .all()
    )

    total = len(playbooks)

    enabled = sum(
        1
        for item in playbooks
        if item.status == "ENABLED"
    )

    disabled = sum(
        1
        for item in playbooks
        if item.status == "DISABLED"
    )

    critical = sum(
        1
        for item in playbooks
        if item.severity == "CRITICAL"
    )

    high = sum(
        1
        for item in playbooks
        if item.severity == "HIGH"
    )

    medium = sum(
        1
        for item in playbooks
        if item.severity == "MEDIUM"
    )

    return {
        "summary": {
            "total_playbooks": total,
            "enabled": enabled,
            "disabled": disabled,
            "critical": critical,
            "high": high,
            "medium": medium,
        },
        "playbooks": [
            playbook_to_dict(item)
            for item in playbooks
        ],
    }


@router.get("/{playbook_id}")
def get_playbook(
    playbook_id: str,
    db: Session = Depends(get_db),
):
    playbook = (
        db.query(SecurityPlaybook)
        .filter(
            SecurityPlaybook.playbook_id
            == playbook_id
        )
        .first()
    )

    if not playbook:
        raise HTTPException(
            status_code=404,
            detail="Security playbook not found",
        )

    return playbook_to_dict(playbook)