from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.security_configuration import SecurityConfiguration


router = APIRouter(
    prefix="/api/security-configurations",
    tags=["Security Configurations"],
)


def serialize_configuration(
    configuration: SecurityConfiguration,
) -> dict:
    return {
        "id": configuration.id,
        "configuration_id": configuration.configuration_id,
        "name": configuration.name,
        "description": configuration.description,
        "configuration_type": configuration.configuration_type,
        "category": configuration.category,
        "asset_id": configuration.asset_id,
        "asset_name": configuration.asset_name,
        "environment": configuration.environment,
        "baseline": configuration.baseline,
        "baseline_version": configuration.baseline_version,
        "compliance_status": configuration.compliance_status,
        "severity": configuration.severity,
        "current_value": configuration.current_value,
        "expected_value": configuration.expected_value,
        "control_reference": configuration.control_reference,
        "remediation": configuration.remediation,
        "owner": configuration.owner,
        "last_checked": configuration.last_checked,
        "created_at": configuration.created_at,
        "updated_at": configuration.updated_at,
    }


@router.get("")
def get_security_configurations(
    db: Session = Depends(get_db),
):
    configurations = (
        db.query(SecurityConfiguration)
        .order_by(SecurityConfiguration.id.asc())
        .all()
    )

    total = len(configurations)

    compliant = sum(
        1
        for configuration in configurations
        if configuration.compliance_status.upper()
        == "COMPLIANT"
    )

    non_compliant = sum(
        1
        for configuration in configurations
        if configuration.compliance_status.upper()
        == "NON_COMPLIANT"
    )

    partially_compliant = sum(
        1
        for configuration in configurations
        if configuration.compliance_status.upper()
        == "PARTIALLY_COMPLIANT"
    )

    critical = sum(
        1
        for configuration in configurations
        if configuration.severity.upper() == "CRITICAL"
    )

    high = sum(
        1
        for configuration in configurations
        if configuration.severity.upper() == "HIGH"
    )

    medium = sum(
        1
        for configuration in configurations
        if configuration.severity.upper() == "MEDIUM"
    )

    low = sum(
        1
        for configuration in configurations
        if configuration.severity.upper() == "LOW"
    )

    return {
        "summary": {
            "total": total,
            "compliant": compliant,
            "non_compliant": non_compliant,
            "partially_compliant": partially_compliant,
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
        },
        "configurations": [
            serialize_configuration(configuration)
            for configuration in configurations
        ],
    }


@router.get("/{configuration_id}")
def get_security_configuration(
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

    return serialize_configuration(configuration)