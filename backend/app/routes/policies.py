from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.policy import Policy


router = APIRouter(
    prefix="/api/policies",
    tags=["Security Policies"],
)


def split_ids(value: str | None) -> list[str]:
    if not value:
        return []

    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


def policy_to_dict(policy: Policy) -> dict[str, Any]:
    return {
        "policy_id": policy.policy_id,
        "title": policy.title,
        "description": policy.description,
        "category": policy.category,
        "status": policy.status,
        "owner": policy.owner,
        "version": policy.version,
        "effective_date": (
            policy.effective_date.isoformat()
            if policy.effective_date
            else None
        ),
        "review_date": (
            policy.review_date.isoformat()
            if policy.review_date
            else None
        ),
        "frameworks": split_ids(
            policy.frameworks
        ),
        "related_control_ids": split_ids(
            policy.related_control_ids
        ),
        "related_risk_ids": split_ids(
            policy.related_risk_ids
        ),
        "created_at": (
            policy.created_at.isoformat()
            if policy.created_at
            else None
        ),
        "updated_at": (
            policy.updated_at.isoformat()
            if policy.updated_at
            else None
        ),
    }


def calculate_review_status(
    policy: Policy,
) -> str:

    if not policy.review_date:
        return "NO_REVIEW_DATE"

    if policy.status.upper() == "EXPIRED":
        return "OVERDUE"

    return "SCHEDULED"


@router.get("")
def get_policies(
    db: Session = Depends(get_db),
) -> dict[str, Any]:

    policies = (
        db.query(Policy)
        .order_by(Policy.review_date.asc())
        .all()
    )

    total = len(policies)

    active = sum(
        1
        for policy in policies
        if policy.status.upper() == "ACTIVE"
    )

    under_review = sum(
        1
        for policy in policies
        if policy.status.upper() == "UNDER_REVIEW"
    )

    draft = sum(
        1
        for policy in policies
        if policy.status.upper() == "DRAFT"
    )

    expired = sum(
        1
        for policy in policies
        if policy.status.upper() == "EXPIRED"
    )

    review_scheduled = sum(
        1
        for policy in policies
        if calculate_review_status(policy) == "SCHEDULED"
    )

    return {
        "summary": {
            "total_policies": total,
            "active": active,
            "under_review": under_review,
            "draft": draft,
            "expired": expired,
            "review_scheduled": review_scheduled,
        },
        "policies": [
            policy_to_dict(policy)
            for policy in policies
        ],
    }


@router.get("/{policy_id}")
def get_policy(
    policy_id: str,
    db: Session = Depends(get_db),
) -> dict[str, Any]:

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

    result = policy_to_dict(policy)

    result["review_status"] = calculate_review_status(
        policy
    )

    return result