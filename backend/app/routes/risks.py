from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.risk import Risk


router = APIRouter(
    prefix="/api/risks",
    tags=["Risk Management"],
)


def split_ids(value: str | None) -> list[str]:
    if not value:
        return []

    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


def risk_to_dict(risk: Risk) -> dict[str, Any]:
    return {
        "risk_id": risk.risk_id,
        "title": risk.title,
        "description": risk.description,
        "category": risk.category,
        "likelihood": risk.likelihood,
        "impact": risk.impact,
        "inherent_score": risk.inherent_score,
        "residual_likelihood": risk.residual_likelihood,
        "residual_impact": risk.residual_impact,
        "residual_score": risk.residual_score,
        "severity": risk.severity,
        "status": risk.status,
        "treatment": risk.treatment,
        "owner": risk.owner,
        "treatment_plan": risk.treatment_plan,
        "due_date": (
            risk.due_date.isoformat()
            if risk.due_date
            else None
        ),
        "related_vulnerability_ids": split_ids(
            risk.related_vulnerability_ids
        ),
        "related_incident_ids": split_ids(
            risk.related_incident_ids
        ),
        "related_control_ids": split_ids(
            risk.related_control_ids
        ),
        "created_at": (
            risk.created_at.isoformat()
            if risk.created_at
            else None
        ),
        "updated_at": (
            risk.updated_at.isoformat()
            if risk.updated_at
            else None
        ),
    }


def calculate_average(values: list[int]) -> float:
    if not values:
        return 0.0

    return round(
        sum(values) / len(values),
        1,
    )


@router.get("")
def get_risks(
    db: Session = Depends(get_db),
) -> dict[str, Any]:

    risks = (
        db.query(Risk)
        .order_by(Risk.residual_score.desc())
        .all()
    )

    total = len(risks)

    critical = sum(
        1
        for risk in risks
        if risk.severity.upper() == "CRITICAL"
    )

    high = sum(
        1
        for risk in risks
        if risk.severity.upper() == "HIGH"
    )

    medium = sum(
        1
        for risk in risks
        if risk.severity.upper() == "MEDIUM"
    )

    low = sum(
        1
        for risk in risks
        if risk.severity.upper() == "LOW"
    )

    open_risks = sum(
        1
        for risk in risks
        if risk.status.upper()
        in {
            "OPEN",
            "UNDER_TREATMENT",
            "MONITORING",
        }
    )

    accepted = sum(
        1
        for risk in risks
        if risk.status.upper() == "ACCEPTED"
    )

    mitigated = sum(
        1
        for risk in risks
        if risk.status.upper() == "MITIGATED"
    )

    inherent_scores = [
        risk.inherent_score
        for risk in risks
    ]

    residual_scores = [
        risk.residual_score
        for risk in risks
    ]

    return {
        "summary": {
            "total_risks": total,
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
            "open_risks": open_risks,
            "accepted": accepted,
            "mitigated": mitigated,
            "average_inherent_score": calculate_average(
                inherent_scores
            ),
            "average_residual_score": calculate_average(
                residual_scores
            ),
        },
        "risks": [
            risk_to_dict(risk)
            for risk in risks
        ],
    }


@router.get("/{risk_id}")
def get_risk(
    risk_id: str,
    db: Session = Depends(get_db),
) -> dict[str, Any]:

    risk = (
        db.query(Risk)
        .filter(Risk.risk_id == risk_id)
        .first()
    )

    if not risk:
        raise HTTPException(
            status_code=404,
            detail="Risk not found",
        )

    return risk_to_dict(risk)