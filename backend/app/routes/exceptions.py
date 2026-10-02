from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.exception import SecurityException


router = APIRouter(
    prefix="/api/exceptions",
    tags=["Security Exceptions"],
)


def split_ids(value: Optional[str]):
    if not value:
        return []

    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


def calculate_expiry_status(
    status: str,
    expiry_date: Optional[date],
):
    if status == "EXPIRED":
        return "EXPIRED"

    if not expiry_date:
        return "NO_EXPIRY_DATE"

    if expiry_date < date.today():
        return "OVERDUE"

    return "ACTIVE"


def exception_to_dict(exception: SecurityException):
    return {
        "exception_id": exception.exception_id,
        "title": exception.title,
        "description": exception.description,
        "category": exception.category,
        "status": exception.status,
        "severity": exception.severity,
        "requester": exception.requester,
        "owner": exception.owner,
        "approver": exception.approver,
        "justification": exception.justification,
        "compensating_controls": exception.compensating_controls,
        "requested_date": (
            exception.requested_date.isoformat()
            if exception.requested_date
            else None
        ),
        "expiry_date": (
            exception.expiry_date.isoformat()
            if exception.expiry_date
            else None
        ),
        "expiry_status": calculate_expiry_status(
            exception.status,
            exception.expiry_date,
        ),
        "related_policy_ids": split_ids(
            exception.related_policy_ids
        ),
        "related_risk_ids": split_ids(
            exception.related_risk_ids
        ),
        "related_control_ids": split_ids(
            exception.related_control_ids
        ),
        "related_vulnerability_ids": split_ids(
            exception.related_vulnerability_ids
        ),
        "created_at": (
            exception.created_at.isoformat()
            if exception.created_at
            else None
        ),
        "updated_at": (
            exception.updated_at.isoformat()
            if exception.updated_at
            else None
        ),
    }


@router.get("")
def get_exceptions(
    db: Session = Depends(get_db),
):
    exceptions = (
        db.query(SecurityException)
        .order_by(
            SecurityException.expiry_date.asc(),
            SecurityException.id.asc(),
        )
        .all()
    )

    total = len(exceptions)

    requested = sum(
        1
        for item in exceptions
        if item.status == "REQUESTED"
    )

    under_review = sum(
        1
        for item in exceptions
        if item.status == "UNDER_REVIEW"
    )

    approved = sum(
        1
        for item in exceptions
        if item.status == "APPROVED"
    )

    rejected = sum(
        1
        for item in exceptions
        if item.status == "REJECTED"
    )

    expired = sum(
        1
        for item in exceptions
        if item.status == "EXPIRED"
    )

    revoked = sum(
        1
        for item in exceptions
        if item.status == "REVOKED"
    )

    overdue = sum(
        1
        for item in exceptions
        if calculate_expiry_status(
            item.status,
            item.expiry_date,
        )
        == "OVERDUE"
    )

    critical = sum(
        1
        for item in exceptions
        if item.severity == "CRITICAL"
    )

    high = sum(
        1
        for item in exceptions
        if item.severity == "HIGH"
    )

    return {
        "summary": {
            "total_exceptions": total,
            "requested": requested,
            "under_review": under_review,
            "approved": approved,
            "rejected": rejected,
            "expired": expired,
            "revoked": revoked,
            "overdue": overdue,
            "critical": critical,
            "high": high,
        },
        "exceptions": [
            exception_to_dict(item)
            for item in exceptions
        ],
    }


@router.get("/{exception_id}")
def get_exception(
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

    return exception_to_dict(exception)