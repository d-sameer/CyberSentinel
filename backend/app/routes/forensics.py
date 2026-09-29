from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, Integer, String, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.database import Base, get_db


class ForensicEvidence(Base):
    __tablename__ = "forensic_evidence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    evidence_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(30), index=True)
    endpoint: Mapped[str] = mapped_column(String(100), index=True)
    evidence_type: Mapped[str] = mapped_column(String(50), index=True)
    source: Mapped[str] = mapped_column(String(100))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ForensicAction(Base):
    __tablename__ = "forensic_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    action_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    evidence_id: Mapped[str] = mapped_column(String(50), index=True)
    action: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(50), index=True)
    analyst: Mapped[str] = mapped_column(String(100), default="SOC Analyst")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ForensicCorrelation(BaseModel):
    type: str
    value: str
    context: str


class ForensicEvidenceResponse(BaseModel):
    evidence_id: str
    status: str
    endpoint: str
    evidence_type: str
    source: str
    correlations: list[ForensicCorrelation]


class ForensicActionRequest(BaseModel):
    action: str
    analyst: str = "SOC Analyst"


class ForensicActionResponse(BaseModel):
    id: int
    action_id: str
    evidence_id: str
    action: str
    status: str
    analyst: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


router = APIRouter(
    prefix="/api/forensics",
    tags=["Forensics"],
)


SEED_EVIDENCE = [
    {
        "evidence_id": "EVD-001",
        "status": "FLAGGED",
        "endpoint": "WIN-01",
        "evidence_type": "PROCESS",
        "source": "Process Telemetry",
    },
    {
        "evidence_id": "EVD-002",
        "status": "ANALYZING",
        "endpoint": "WIN-01",
        "evidence_type": "FILE",
        "source": "File Integrity",
    },
    {
        "evidence_id": "EVD-003",
        "status": "FLAGGED",
        "endpoint": "WIN-01",
        "evidence_type": "NETWORK",
        "source": "Network Telemetry",
    },
    {
        "evidence_id": "EVD-004",
        "status": "FLAGGED",
        "endpoint": "WIN-02",
        "evidence_type": "PROCESS",
        "source": "Process Telemetry",
    },
    {
        "evidence_id": "EVD-005",
        "status": "ANALYZING",
        "endpoint": "WIN-02",
        "evidence_type": "FILE",
        "source": "File Integrity",
    },
    {
        "evidence_id": "EVD-006",
        "status": "VERIFIED",
        "endpoint": "LINUX-01",
        "evidence_type": "USER ACTIVITY",
        "source": "Authentication Logs",
    },
    {
        "evidence_id": "EVD-007",
        "status": "FLAGGED",
        "endpoint": "WIN-02",
        "evidence_type": "SYSTEM",
        "source": "File Integrity",
    },
    {
        "evidence_id": "EVD-008",
        "status": "COLLECTED",
        "endpoint": "WIN-02",
        "evidence_type": "USER ACTIVITY",
        "source": "Windows Event Logs",
    },
]


CORRELATIONS = {
    "EVD-001": [
        {
            "type": "ENDPOINT",
            "value": "WIN-01",
            "context": "Endpoint associated with the PowerShell execution trace",
        },
        {
            "type": "PROCESS",
            "value": "powershell.exe",
            "context": "Process recorded in the forensic evidence item",
        },
        {
            "type": "FILE",
            "value": "update.ps1",
            "context": "Script executed by the recorded PowerShell process",
        },
    ],
    "EVD-002": [
        {
            "type": "ENDPOINT",
            "value": "WIN-01",
            "context": "Endpoint associated with the file artifact",
        },
        {
            "type": "PROCESS",
            "value": "powershell.exe",
            "context": "Process recorded as related to the file artifact",
        },
        {
            "type": "FILE",
            "value": "update.ps1",
            "context": "File artifact under forensic analysis",
        },
    ],
    "EVD-003": [
        {
            "type": "ENDPOINT",
            "value": "WIN-01",
            "context": "Endpoint associated with the network artifact",
        },
        {
            "type": "PROCESS",
            "value": "powershell.exe",
            "context": "Process recorded as related to the connection",
        },
        {
            "type": "NETWORK",
            "value": "203.0.113.45:443",
            "context": "Outbound HTTPS network artifact",
        },
    ],
    "EVD-004": [
        {
            "type": "ENDPOINT",
            "value": "WIN-02",
            "context": "Endpoint associated with the unsigned executable",
        },
        {
            "type": "PROCESS",
            "value": "unknown_update.exe",
            "context": "Unsigned executable recorded in process telemetry",
        },
        {
            "type": "FILE",
            "value": "payload.bin",
            "context": "Related binary artifact",
        },
    ],
    "EVD-005": [
        {
            "type": "ENDPOINT",
            "value": "WIN-02",
            "context": "Endpoint associated with the created binary",
        },
        {
            "type": "PROCESS",
            "value": "unknown_update.exe",
            "context": "Originating process recorded in the evidence item",
        },
        {
            "type": "FILE",
            "value": "payload.bin",
            "context": "New binary artifact under analysis",
        },
    ],
    "EVD-006": [
        {
            "type": "ENDPOINT",
            "value": "LINUX-01",
            "context": "Endpoint associated with the SSH authorization change",
        },
        {
            "type": "FILE",
            "value": "authorized_keys",
            "context": "Authorization file changed during the recorded activity",
        },
        {
            "type": "PROCESS",
            "value": "sshd",
            "context": "SSH service associated with the activity",
        },
    ],
    "EVD-007": [
        {
            "type": "ENDPOINT",
            "value": "WIN-02",
            "context": "Endpoint associated with the protected file deletion",
        },
        {
            "type": "PROCESS",
            "value": "services.exe",
            "context": "Process recorded as related to the deletion",
        },
        {
            "type": "FILE",
            "value": "temp_rules.xml",
            "context": "Protected security rules file recorded as deleted",
        },
    ],
    "EVD-008": [
        {
            "type": "ENDPOINT",
            "value": "WIN-02",
            "context": "Endpoint associated with the authentication evidence",
        },
        {
            "type": "PROCESS",
            "value": "winlogon.exe",
            "context": "Process associated with Windows authentication records",
        },
        {
            "type": "FILE",
            "value": "Security.evtx",
            "context": "Windows Security Event Log artifact",
        },
    ],
}


ALLOWED_ACTIONS = {
    "START_ANALYSIS": "ANALYSIS_STARTED",
    "PRESERVE_EVIDENCE": "EVIDENCE_PRESERVED",
    "ESCALATE_EVIDENCE": "ESCALATION_REQUESTED",
    "MARK_VERIFIED": "VERIFIED",
}


def seed_evidence(db: Session) -> None:
    existing = db.scalars(select(ForensicEvidence.evidence_id)).all()
    existing_ids = set(existing)
    created = False

    for item in SEED_EVIDENCE:
        if item["evidence_id"] in existing_ids:
            continue

        db.add(ForensicEvidence(**item))
        created = True

    if created:
        db.commit()


@router.get("/{evidence_id}", response_model=ForensicEvidenceResponse)
def read_forensic_evidence(
    evidence_id: str,
    db: Session = Depends(get_db),
):
    seed_evidence(db)

    evidence = db.scalar(
        select(ForensicEvidence).where(
            ForensicEvidence.evidence_id == evidence_id
        )
    )

    if evidence is None:
        raise HTTPException(status_code=404, detail="Forensic evidence not found")

    return {
        "evidence_id": evidence.evidence_id,
        "status": evidence.status,
        "endpoint": evidence.endpoint,
        "evidence_type": evidence.evidence_type,
        "source": evidence.source,
        "correlations": CORRELATIONS.get(evidence_id, []),
    }


@router.get(
    "/{evidence_id}/actions",
    response_model=list[ForensicActionResponse],
)
def read_forensic_actions(
    evidence_id: str,
    db: Session = Depends(get_db),
):
    statement = (
        select(ForensicAction)
        .where(ForensicAction.evidence_id == evidence_id)
        .order_by(ForensicAction.created_at.desc())
    )

    return db.scalars(statement).all()


@router.post(
    "/{evidence_id}/actions",
    response_model=ForensicActionResponse,
)
def create_forensic_action(
    evidence_id: str,
    payload: ForensicActionRequest,
    db: Session = Depends(get_db),
):
    seed_evidence(db)

    evidence = db.scalar(
        select(ForensicEvidence).where(
            ForensicEvidence.evidence_id == evidence_id
        )
    )

    if evidence is None:
        raise HTTPException(status_code=404, detail="Forensic evidence not found")

    action = payload.action.upper().strip()

    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported forensic response action",
        )

    analyst = payload.analyst.strip() or "SOC Analyst"

    record = ForensicAction(
        action_id=f"FORACT-{uuid4().hex[:8].upper()}",
        evidence_id=evidence_id,
        action=action,
        status=ALLOWED_ACTIONS[action],
        analyst=analyst,
    )

    if action == "MARK_VERIFIED":
        evidence.status = "VERIFIED"
        evidence.updated_at = datetime.utcnow()

    db.add(record)
    db.commit()
    db.refresh(record)

    return record
