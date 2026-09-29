from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, Integer, String, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.database import Base, get_db


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vulnerability_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    cve: Mapped[str] = mapped_column(String(100), index=True)
    status: Mapped[str] = mapped_column(String(30), index=True)
    related_alert: Mapped[str] = mapped_column(String(50), default="None")
    related_incident: Mapped[str] = mapped_column(String(50), default="None")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class VulnerabilityAction(Base):
    __tablename__ = "vulnerability_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    action_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    vulnerability_id: Mapped[str] = mapped_column(String(50), index=True)
    action: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(50), index=True)
    analyst: Mapped[str] = mapped_column(String(100), default="SOC Analyst")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class VulnerabilityResponse(BaseModel):
    vulnerability_id: str
    cve: str
    status: str
    related_alert: str
    related_incident: str
    correlations: list[dict[str, str]]


class VulnerabilityActionRequest(BaseModel):
    action: str
    analyst: str = "SOC Analyst"


class VulnerabilityActionResponse(BaseModel):
    id: int
    action_id: str
    vulnerability_id: str
    action: str
    status: str
    analyst: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


router = APIRouter(prefix="/api/vulnerabilities", tags=["Vulnerabilities"])


SEED_VULNERABILITIES = [
    {
        "vulnerability_id": "VULN-001",
        "cve": "CVE-2024-21413",
        "status": "OPEN",
        "related_alert": "ALT-018",
        "related_incident": "INC-003",
    },
    {
        "vulnerability_id": "VULN-002",
        "cve": "CVE-2023-23397",
        "status": "PATCH AVAILABLE",
        "related_alert": "ALT-021",
        "related_incident": "INC-001",
    },
    {
        "vulnerability_id": "VULN-003",
        "cve": "CVE-2021-44228",
        "status": "MITIGATED",
        "related_alert": "None",
        "related_incident": "None",
    },
    {
        "vulnerability_id": "VULN-004",
        "cve": "CVE-2022-30190",
        "status": "OPEN",
        "related_alert": "ALT-037",
        "related_incident": "None",
    },
    {
        "vulnerability_id": "VULN-005",
        "cve": "CVE-2023-4863",
        "status": "PATCH AVAILABLE",
        "related_alert": "ALT-031",
        "related_incident": "INC-006",
    },
]


CORRELATIONS = {
    "VULN-001": [
        {"type": "EVENT", "value": "EVT-1048", "context": "Known network security event on WIN-01"},
        {"type": "ALERT", "value": "ALT-018", "context": "Known alert associated with EVT-1048"},
        {"type": "INCIDENT", "value": "INC-003", "context": "Known incident associated with ALT-018"},
        {"type": "ENDPOINT", "value": "WIN-01", "context": "Affected endpoint"},
    ],
    "VULN-002": [
        {"type": "EVENT", "value": "EVT-1047", "context": "Known endpoint security event on WIN-02"},
        {"type": "ALERT", "value": "ALT-021", "context": "Known alert associated with EVT-1047"},
        {"type": "INCIDENT", "value": "INC-001", "context": "Known incident associated with ALT-021"},
        {"type": "ENDPOINT", "value": "WIN-02", "context": "Affected endpoint"},
    ],
    "VULN-003": [
        {"type": "ASSET", "value": "APP-SRV-01", "context": "Application server listed in the vulnerability finding"},
    ],
    "VULN-004": [
        {"type": "EVENT", "value": "EVT-1042", "context": "Known administrative security event on WIN-03"},
        {"type": "ALERT", "value": "ALT-037", "context": "Known alert associated with EVT-1042"},
        {"type": "ENDPOINT", "value": "WIN-03", "context": "Affected endpoint"},
    ],
    "VULN-005": [
        {"type": "EVENT", "value": "EVT-1045", "context": "Known endpoint security event on WIN-04"},
        {"type": "ALERT", "value": "ALT-031", "context": "Known alert associated with EVT-1045"},
        {"type": "INCIDENT", "value": "INC-006", "context": "Known incident associated with ALT-031"},
        {"type": "ENDPOINT", "value": "WIN-04", "context": "Affected endpoint"},
    ],
}


ALLOWED_ACTIONS = {
    "MARK_MITIGATED": "MITIGATED",
    "CREATE_REMEDIATION_TASK": "REMEDIATION_TASK_CREATED",
    "REVIEW_CVE": "CVE_REVIEWED",
}


def seed_vulnerabilities(db: Session) -> None:
    existing = db.scalars(select(Vulnerability.vulnerability_id)).all()
    existing_ids = set(existing)
    created = False

    for item in SEED_VULNERABILITIES:
        if item["vulnerability_id"] in existing_ids:
            continue

        db.add(Vulnerability(**item))
        created = True

    if created:
        db.commit()


@router.get("/{vulnerability_id}", response_model=VulnerabilityResponse)
def read_vulnerability(vulnerability_id: str, db: Session = Depends(get_db)):
    seed_vulnerabilities(db)

    vulnerability = db.scalar(
        select(Vulnerability).where(
            Vulnerability.vulnerability_id == vulnerability_id
        )
    )

    if vulnerability is None:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    return {
        "vulnerability_id": vulnerability.vulnerability_id,
        "cve": vulnerability.cve,
        "status": vulnerability.status,
        "related_alert": vulnerability.related_alert,
        "related_incident": vulnerability.related_incident,
        "correlations": CORRELATIONS.get(vulnerability_id, []),
    }


@router.get(
    "/{vulnerability_id}/actions",
    response_model=list[VulnerabilityActionResponse],
)
def read_vulnerability_actions(
    vulnerability_id: str,
    db: Session = Depends(get_db),
):
    statement = (
        select(VulnerabilityAction)
        .where(VulnerabilityAction.vulnerability_id == vulnerability_id)
        .order_by(VulnerabilityAction.created_at.desc())
    )
    return db.scalars(statement).all()


@router.post(
    "/{vulnerability_id}/actions",
    response_model=VulnerabilityActionResponse,
)
def create_vulnerability_action(
    vulnerability_id: str,
    payload: VulnerabilityActionRequest,
    db: Session = Depends(get_db),
):
    seed_vulnerabilities(db)

    vulnerability = db.scalar(
        select(Vulnerability).where(
            Vulnerability.vulnerability_id == vulnerability_id
        )
    )

    if vulnerability is None:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    action = payload.action.upper().strip()

    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported vulnerability response action",
        )

    analyst = payload.analyst.strip() or "SOC Analyst"

    record = VulnerabilityAction(
        action_id=f"VULNACT-{uuid4().hex[:8].upper()}",
        vulnerability_id=vulnerability_id,
        action=action,
        status=ALLOWED_ACTIONS[action],
        analyst=analyst,
    )

    if action == "MARK_MITIGATED":
        vulnerability.status = "MITIGATED"
        vulnerability.updated_at = datetime.utcnow()

    db.add(record)
    db.commit()
    db.refresh(record)

    return record
