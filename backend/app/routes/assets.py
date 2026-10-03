from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import SecurityAsset


router = APIRouter(
    prefix="/api/assets",
    tags=["Security Assets"],
)


def split_values(value: str) -> list[str]:
    if not value:
        return []

    return [
        item.strip()
        for item in value.split("|")
        if item.strip()
    ]


def serialize_asset(asset: SecurityAsset) -> dict:
    return {
        "id": asset.id,
        "asset_id": asset.asset_id,
        "name": asset.name,
        "description": asset.description,
        "asset_type": asset.asset_type,
        "category": asset.category,
        "environment": asset.environment,
        "location": asset.location,
        "owner": asset.owner,
        "business_unit": asset.business_unit,
        "operating_system": asset.operating_system,
        "technologies": split_values(asset.technologies),
        "criticality": asset.criticality,
        "business_importance": asset.business_importance,
        "status": asset.status,
        "security_status": asset.security_status,
        "exposure": asset.exposure,
        "risk_level": asset.risk_level,
        "ip_address": asset.ip_address,
        "hostname": asset.hostname,
        "related_endpoint_ids": split_values(
            asset.related_endpoint_ids
        ),
        "related_vulnerability_ids": split_values(
            asset.related_vulnerability_ids
        ),
        "related_incident_ids": split_values(
            asset.related_incident_ids
        ),
        "related_alert_ids": split_values(
            asset.related_alert_ids
        ),
        "related_architecture_ids": split_values(
            asset.related_architecture_ids
        ),
        "created_at": asset.created_at,
        "updated_at": asset.updated_at,
    }


@router.get("")
def get_assets(
    db: Session = Depends(get_db),
):
    assets = (
        db.query(SecurityAsset)
        .order_by(SecurityAsset.id.asc())
        .all()
    )

    total = len(assets)

    active = sum(
        1
        for asset in assets
        if asset.status.upper() == "ACTIVE"
    )

    inactive = sum(
        1
        for asset in assets
        if asset.status.upper() == "INACTIVE"
    )

    critical = sum(
        1
        for asset in assets
        if asset.criticality.upper() == "CRITICAL"
    )

    high_risk = sum(
        1
        for asset in assets
        if asset.risk_level.upper() == "HIGH"
    )

    medium_risk = sum(
        1
        for asset in assets
        if asset.risk_level.upper() == "MEDIUM"
    )

    low_risk = sum(
        1
        for asset in assets
        if asset.risk_level.upper() == "LOW"
    )

    external = sum(
        1
        for asset in assets
        if asset.exposure.upper() == "EXTERNAL"
    )

    secure = sum(
        1
        for asset in assets
        if asset.security_status.upper() == "SECURE"
    )

    attention_required = sum(
        1
        for asset in assets
        if asset.security_status.upper()
        in {"AT_RISK", "COMPROMISED", "DEGRADED"}
    )

    return {
        "summary": {
            "total": total,
            "active": active,
            "inactive": inactive,
            "critical": critical,
            "high_risk": high_risk,
            "medium_risk": medium_risk,
            "low_risk": low_risk,
            "external": external,
            "secure": secure,
            "attention_required": attention_required,
        },
        "assets": [
            serialize_asset(asset)
            for asset in assets
        ],
    }


@router.get("/{asset_id}")
def get_asset(
    asset_id: str,
    db: Session = Depends(get_db),
):
    asset = (
        db.query(SecurityAsset)
        .filter(
            SecurityAsset.asset_id == asset_id
        )
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Security asset not found",
        )

    return serialize_asset(asset)