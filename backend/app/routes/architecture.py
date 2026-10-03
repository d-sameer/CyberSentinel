from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.architecture import SecurityArchitecture


router = APIRouter(
    prefix="/api/architecture",
    tags=["Security Architecture"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def split_values(value: str) -> list[str]:
    if not value:
        return []

    return [
        item.strip()
        for item in value.split("|")
        if item.strip()
    ]


def serialize_architecture(item: SecurityArchitecture) -> dict:
    return {
        "id": item.id,
        "architecture_id": item.architecture_id,
        "name": item.name,
        "description": item.description,
        "architecture_type": item.architecture_type,
        "zone": item.zone,
        "security_layer": item.security_layer,
        "component_type": item.component_type,
        "status": item.status,
        "criticality": item.criticality,
        "owner": item.owner,
        "technologies": split_values(item.technologies),
        "security_controls": split_values(item.security_controls),
        "connected_components": split_values(
            item.connected_components
        ),
        "trust_level": item.trust_level,
        "exposure": item.exposure,
        "risk_level": item.risk_level,
        "created_at": (
            item.created_at.isoformat()
            if item.created_at
            else None
        ),
        "updated_at": (
            item.updated_at.isoformat()
            if item.updated_at
            else None
        ),
    }


@router.get("")
def get_architecture(
    db: Session = Depends(get_db),
):
    records = (
        db.query(SecurityArchitecture)
        .order_by(SecurityArchitecture.id.asc())
        .all()
    )

    summary = {
        "total": len(records),
        "active": sum(
            1
            for item in records
            if item.status.upper() == "ACTIVE"
        ),
        "inactive": sum(
            1
            for item in records
            if item.status.upper() == "INACTIVE"
        ),
        "critical": sum(
            1
            for item in records
            if item.criticality.upper() == "CRITICAL"
        ),
        "high": sum(
            1
            for item in records
            if item.criticality.upper() == "HIGH"
        ),
        "medium": sum(
            1
            for item in records
            if item.criticality.upper() == "MEDIUM"
        ),
        "low": sum(
            1
            for item in records
            if item.criticality.upper() == "LOW"
        ),
        "high_risk": sum(
            1
            for item in records
            if item.risk_level.upper() in {"CRITICAL", "HIGH"}
        ),
        "external": sum(
            1
            for item in records
            if item.exposure.upper() == "EXTERNAL"
        ),
    }

    return {
        "summary": summary,
        "total": len(records),
        "architecture": [
            serialize_architecture(item)
            for item in records
        ],
    }


@router.get("/{architecture_id}")
def get_architecture_details(
    architecture_id: str,
    db: Session = Depends(get_db),
):
    item = (
        db.query(SecurityArchitecture)
        .filter(
            SecurityArchitecture.architecture_id
            == architecture_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Architecture component not found",
        )

    return serialize_architecture(item)