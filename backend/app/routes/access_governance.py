from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.access_governance import AccessGovernance


router = APIRouter(
    prefix="/api/access-governance",
    tags=["Access Governance"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# SCHEMAS
# ============================================================

class AccessGovernanceCreate(BaseModel):
    user_id: str
    username: str
    email: str | None = None

    role: str
    access_level: str
    permissions: str | None = None

    mfa_enabled: bool = False
    privileged_access: bool = False
    least_privilege_status: str = "Compliant"

    access_review_status: str = "Pending"
    last_reviewed: datetime | None = None
    review_due_date: datetime | None = None

    account_status: str = "Active"
    notes: str | None = None


class AccessGovernanceUpdate(BaseModel):
    user_id: str | None = None
    username: str | None = None
    email: str | None = None

    role: str | None = None
    access_level: str | None = None
    permissions: str | None = None

    mfa_enabled: bool | None = None
    privileged_access: bool | None = None
    least_privilege_status: str | None = None

    access_review_status: str | None = None
    last_reviewed: datetime | None = None
    review_due_date: datetime | None = None

    account_status: str | None = None
    notes: str | None = None


# ============================================================
# SEED DATA
# ============================================================

SEED_ACCESS_GOVERNANCE = [
    {
        "user_id": "USR-001",
        "username": "sameer",
        "email": "sameer@cybersentinel.local",
        "role": "Security Analyst",
        "access_level": "Medium",
        "permissions": "Alert Investigation, Threat Intelligence",
        "mfa_enabled": True,
        "privileged_access": False,
        "least_privilege_status": "Compliant",
        "access_review_status": "Approved",
        "last_reviewed": datetime(2026, 9, 28, 10, 0),
        "review_due_date": datetime(2026, 12, 28, 10, 0),
        "account_status": "Active",
        "notes": "Standard SOC analyst account",
    },
    {
        "user_id": "USR-002",
        "username": "admin",
        "email": "admin@cybersentinel.local",
        "role": "Security Administrator",
        "access_level": "Critical",
        "permissions": (
            "User Management, Incident Response, "
            "Security Configuration"
        ),
        "mfa_enabled": True,
        "privileged_access": True,
        "least_privilege_status": "Compliant",
        "access_review_status": "Review Required",
        "last_reviewed": datetime(2026, 9, 21, 10, 0),
        "review_due_date": datetime(2026, 10, 21, 10, 0),
        "account_status": "Active",
        "notes": "Privileged security administrator account",
    },
    {
        "user_id": "USR-003",
        "username": "svc-backup",
        "email": "svc-backup@cybersentinel.local",
        "role": "Backup Service",
        "access_level": "High",
        "permissions": "Backup Management, Storage Access",
        "mfa_enabled": False,
        "privileged_access": False,
        "least_privilege_status": "Compliant",
        "access_review_status": "Approved",
        "last_reviewed": datetime(2026, 9, 25, 10, 0),
        "review_due_date": datetime(2026, 12, 25, 10, 0),
        "account_status": "Active",
        "notes": "Service account exempt from interactive MFA",
    },
    {
        "user_id": "USR-004",
        "username": "john.doe",
        "email": "john.doe@cybersentinel.local",
        "role": "IT Operations",
        "access_level": "High",
        "permissions": "Endpoint Management, System Administration",
        "mfa_enabled": False,
        "privileged_access": False,
        "least_privilege_status": "Review Required",
        "access_review_status": "Pending",
        "last_reviewed": datetime(2026, 9, 18, 10, 0),
        "review_due_date": datetime(2026, 10, 18, 10, 0),
        "account_status": "Active",
        "notes": "Access review pending",
    },
    {
        "user_id": "USR-005",
        "username": "security-admin",
        "email": "security-admin@cybersentinel.local",
        "role": "SOC Administrator",
        "access_level": "Critical",
        "permissions": (
            "SOC Management, Detection Rules, "
            "Incident Response"
        ),
        "mfa_enabled": True,
        "privileged_access": True,
        "least_privilege_status": "Compliant",
        "access_review_status": "Approved",
        "last_reviewed": datetime(2026, 9, 27, 10, 0),
        "review_due_date": datetime(2026, 12, 27, 10, 0),
        "account_status": "Active",
        "notes": "SOC privileged administrator account",
    },
]


# ============================================================
# SEED DATABASE
# ============================================================

def seed_access_governance(db: Session):
    existing_users = {
        row[0]
        for row in db.query(
            AccessGovernance.user_id
        ).all()
    }

    created = 0

    for item in SEED_ACCESS_GOVERNANCE:
        if item["user_id"] in existing_users:
            continue

        db.add(
            AccessGovernance(**item)
        )

        created += 1

    if created:
        db.commit()

    return created


# ============================================================
# GET ALL ACCESS GOVERNANCE RECORDS
# ============================================================

@router.get("")
def get_access_governance(
    db: Session = Depends(get_db),
):
    # Create the initial five records if the table is empty.
    seed_access_governance(db)

    records = (
        db.query(AccessGovernance)
        .order_by(AccessGovernance.id.desc())
        .all()
    )

    return records


# ============================================================
# GET SINGLE RECORD
# ============================================================

@router.get("/{record_id}")
def get_access_governance_record(
    record_id: int,
    db: Session = Depends(get_db),
):
    # Make sure seed records exist.
    seed_access_governance(db)

    record = (
        db.query(AccessGovernance)
        .filter(
            AccessGovernance.id == record_id
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Access governance record not found",
        )

    return record


# ============================================================
# CREATE ACCESS GOVERNANCE RECORD
# ============================================================

@router.post("")
def create_access_governance(
    data: AccessGovernanceCreate,
    db: Session = Depends(get_db),
):
    # Prevent duplicate user IDs.
    existing = (
        db.query(AccessGovernance)
        .filter(
            AccessGovernance.user_id
            == data.user_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="An access governance record already exists for this user ID",
        )

    record = AccessGovernance(
        **data.model_dump()
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


# ============================================================
# UPDATE ACCESS GOVERNANCE RECORD
# ============================================================

@router.put("/{record_id}")
def update_access_governance(
    record_id: int,
    data: AccessGovernanceUpdate,
    db: Session = Depends(get_db),
):
    record = (
        db.query(AccessGovernance)
        .filter(
            AccessGovernance.id == record_id
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Access governance record not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    # If user_id is being changed, make sure it
    # doesn't conflict with another record.
    if "user_id" in update_data:
        existing = (
            db.query(AccessGovernance)
            .filter(
                AccessGovernance.user_id
                == update_data["user_id"],
                AccessGovernance.id
                != record_id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Another access governance record already uses this user ID",
            )

    for field, value in update_data.items():
        setattr(
            record,
            field,
            value,
        )

    db.commit()
    db.refresh(record)

    return record


# ============================================================
# DELETE ACCESS GOVERNANCE RECORD
# ============================================================

@router.delete("/{record_id}")
def delete_access_governance(
    record_id: int,
    db: Session = Depends(get_db),
):
    record = (
        db.query(AccessGovernance)
        .filter(
            AccessGovernance.id == record_id
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Access governance record not found",
        )

    db.delete(record)
    db.commit()

    return {
        "message": (
            "Access governance record "
            "deleted successfully"
        ),
        "id": record_id,
    }