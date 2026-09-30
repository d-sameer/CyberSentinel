from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.compliance import ComplianceControl


router = APIRouter(
    prefix="/api/compliance",
    tags=["Compliance"],
)


def split_ids(value: str | None) -> list[str]:
    if not value:
        return []

    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


def control_to_dict(control: ComplianceControl) -> dict[str, Any]:
    return {
        "control_id": control.control_id,
        "framework": control.framework,
        "control_name": control.control_name,
        "description": control.description,
        "category": control.category,
        "status": control.status,
        "owner": control.owner,
        "evidence_status": control.evidence_status,
        "related_event_ids": split_ids(
            control.related_event_ids
        ),
        "related_alert_ids": split_ids(
            control.related_alert_ids
        ),
        "related_incident_ids": split_ids(
            control.related_incident_ids
        ),
        "last_reviewed": (
            control.last_reviewed.isoformat()
            if control.last_reviewed
            else None
        ),
    }


def calculate_percentage(
    value: int,
    total: int,
) -> float:
    if total == 0:
        return 0.0

    return round(
        (value / total) * 100,
        1,
    )


@router.get("")
def get_compliance(
    db: Session = Depends(get_db),
):
    controls = (
        db.query(ComplianceControl)
        .order_by(
            ComplianceControl.framework,
            ComplianceControl.control_id,
        )
        .all()
    )

    total_controls = len(controls)

    compliant = sum(
        1
        for control in controls
        if control.status.upper() == "COMPLIANT"
    )

    non_compliant = sum(
        1
        for control in controls
        if control.status.upper() == "NON_COMPLIANT"
    )

    needs_review = sum(
        1
        for control in controls
        if control.status.upper() == "NEEDS_REVIEW"
    )

    partial = sum(
        1
        for control in controls
        if control.status.upper() == "PARTIAL"
    )

    evidence_verified = sum(
        1
        for control in controls
        if control.evidence_status.upper() == "VERIFIED"
    )

    evidence_pending = sum(
        1
        for control in controls
        if control.evidence_status.upper() == "PENDING"
    )

    evidence_missing = sum(
        1
        for control in controls
        if control.evidence_status.upper() == "MISSING"
    )

    framework_summary: dict[str, dict[str, int]] = {}

    for control in controls:
        framework = control.framework

        if framework not in framework_summary:
            framework_summary[framework] = {
                "total": 0,
                "compliant": 0,
                "non_compliant": 0,
                "needs_review": 0,
                "partial": 0,
            }

        framework_summary[framework]["total"] += 1

        status = control.status.upper()

        if status == "COMPLIANT":
            framework_summary[framework]["compliant"] += 1

        elif status == "NON_COMPLIANT":
            framework_summary[framework]["non_compliant"] += 1

        elif status == "NEEDS_REVIEW":
            framework_summary[framework]["needs_review"] += 1

        elif status == "PARTIAL":
            framework_summary[framework]["partial"] += 1

    framework_data = []

    for framework, summary in framework_summary.items():
        score = calculate_percentage(
            summary["compliant"],
            summary["total"],
        )

        framework_data.append(
            {
                "framework": framework,
                **summary,
                "score": score,
            }
        )

    if total_controls:
        compliance_score = round(
            (
                compliant
                + (partial * 0.5)
            )
            / total_controls
            * 100,
            1,
        )
    else:
        compliance_score = 100.0

    return {
        "summary": {
            "compliance_score": compliance_score,
            "total_controls": total_controls,
            "compliant": compliant,
            "non_compliant": non_compliant,
            "needs_review": needs_review,
            "partial": partial,
            "evidence_verified": evidence_verified,
            "evidence_pending": evidence_pending,
            "evidence_missing": evidence_missing,
            "compliance_rate": calculate_percentage(
                compliant,
                total_controls,
            ),
        },
        "frameworks": framework_data,
        "controls": [
            control_to_dict(control)
            for control in controls
        ],
    }


@router.get("/{control_id}")
def get_compliance_control(
    control_id: str,
    db: Session = Depends(get_db),
):
    control = (
        db.query(ComplianceControl)
        .filter(
            ComplianceControl.control_id == control_id
        )
        .first()
    )

    if not control:
        raise HTTPException(
            status_code=404,
            detail="Compliance control not found",
        )

    return control_to_dict(control)