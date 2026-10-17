from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, Integer, String, inspect, select, text
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.database import Base, get_db


class ForensicEvidence(Base):
    __tablename__ = "forensic_evidence"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    evidence_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        default="",
    )

    status: Mapped[str] = mapped_column(
        String(30),
        index=True,
    )

    endpoint: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    evidence_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    source: Mapped[str] = mapped_column(
        String(100),
    )

    collected: Mapped[str] = mapped_column(
        String(100),
        default="",
    )

    analyst: Mapped[str] = mapped_column(
        String(100),
        default="SOC Analyst",
    )

    description: Mapped[str] = mapped_column(
        String(500),
        default="",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


class ForensicAction(Base):
    __tablename__ = "forensic_actions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    action_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
    )

    evidence_id: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    action: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        index=True,
    )

    analyst: Mapped[str] = mapped_column(
        String(100),
        default="SOC Analyst",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


class ForensicCorrelation(BaseModel):
    type: str
    value: str
    context: str


class ForensicEvidenceResponse(BaseModel):
    evidence_id: str
    name: str
    status: str
    endpoint: str
    evidence_type: str
    source: str
    collected: str
    analyst: str
    description: str
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
        "name": "powershell.exe execution trace",
        "status": "FLAGGED",
        "endpoint": "WIN-01",
        "evidence_type": "PROCESS",
        "source": "Process Telemetry",
        "collected": "Today, 10:06:14",
        "analyst": "SOC Analyst",
        "description": (
            "Execution trace associated with an "
            "ExecutionPolicy Bypass command."
        ),
    },
    {
        "evidence_id": "EVD-002",
        "name": "update.ps1 file artifact",
        "status": "ANALYZING",
        "endpoint": "WIN-01",
        "evidence_type": "FILE",
        "source": "File Integrity",
        "collected": "Today, 10:06:28",
        "analyst": "SOC Analyst",
        "description": (
            "PowerShell script whose integrity baseline "
            "changed after execution."
        ),
    },
    {
        "evidence_id": "EVD-003",
        "name": "Outbound HTTPS connection",
        "status": "FLAGGED",
        "endpoint": "WIN-01",
        "evidence_type": "NETWORK",
        "source": "Network Telemetry",
        "collected": "Today, 10:06:42",
        "analyst": "SOC Analyst",
        "description": (
            "Outbound connection associated with "
            "suspicious process activity."
        ),
    },
    {
        "evidence_id": "EVD-004",
        "name": "unknown_update.exe execution",
        "status": "FLAGGED",
        "endpoint": "WIN-02",
        "evidence_type": "PROCESS",
        "source": "Process Telemetry",
        "collected": "Today, 10:25:11",
        "analyst": "SOC Analyst",
        "description": (
            "Unsigned executable launched from "
            "a temporary directory."
        ),
    },
    {
        "evidence_id": "EVD-005",
        "name": "payload.bin creation",
        "status": "ANALYZING",
        "endpoint": "WIN-02",
        "evidence_type": "FILE",
        "source": "File Integrity",
        "collected": "Today, 10:25:23",
        "analyst": "SOC Analyst",
        "description": (
            "New binary created shortly after "
            "suspicious process execution."
        ),
    },
    {
        "evidence_id": "EVD-006",
        "name": "SSH authorization change",
        "status": "VERIFIED",
        "endpoint": "LINUX-01",
        "evidence_type": "USER ACTIVITY",
        "source": "Authentication Logs",
        "collected": "Today, 09:59:03",
        "analyst": "SOC Analyst",
        "description": (
            "Change to the authorized_keys file "
            "associated with an SSH session."
        ),
    },
    {
        "evidence_id": "EVD-007",
        "name": "Windows security rules deletion",
        "status": "FLAGGED",
        "endpoint": "WIN-02",
        "evidence_type": "SYSTEM",
        "source": "File Integrity",
        "collected": "Today, 10:26:39",
        "analyst": "SOC Analyst",
        "description": (
            "Protected security rules file was "
            "deleted from the endpoint."
        ),
    },
    {
        "evidence_id": "EVD-008",
        "name": "Endpoint authentication events",
        "status": "COLLECTED",
        "endpoint": "WIN-02",
        "evidence_type": "USER ACTIVITY",
        "source": "Windows Event Logs",
        "collected": "Today, 10:27:12",
        "analyst": "SOC Analyst",
        "description": (
            "Authentication activity collected "
            "for timeline correlation."
        ),
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


def ensure_forensics_schema(db: Session) -> None:
    """
    Safely add the newer forensic columns to an existing
    SQLite database without deleting existing data.
    """

    bind = db.get_bind()

    inspector = inspect(bind)

    if "forensic_evidence" not in inspector.get_table_names():
        Base.metadata.create_all(bind=bind)
        return

    existing_columns = {
        column["name"]
        for column in inspector.get_columns("forensic_evidence")
    }

    migrations = {
        "name": "VARCHAR(255)",
        "collected": "VARCHAR(100)",
        "analyst": "VARCHAR(100)",
        "description": "VARCHAR(500)",
    }

    for column_name, column_type in migrations.items():
        if column_name not in existing_columns:
            db.execute(
                text(
                    f"ALTER TABLE forensic_evidence "
                    f"ADD COLUMN {column_name} {column_type}"
                )
            )

    db.commit()


def seed_evidence(db: Session) -> None:
    ensure_forensics_schema(db)

    existing = db.scalars(
        select(ForensicEvidence)
    ).all()

    existing_by_id = {
        item.evidence_id: item
        for item in existing
    }

    changed = False

    for seed_item in SEED_EVIDENCE:

        evidence_id = seed_item["evidence_id"]

        existing_item = existing_by_id.get(evidence_id)

        if existing_item is None:
            db.add(
                ForensicEvidence(
                    **seed_item
                )
            )

            changed = True

        else:
            existing_item.name = seed_item["name"]
            existing_item.status = seed_item["status"]
            existing_item.endpoint = seed_item["endpoint"]
            existing_item.evidence_type = seed_item[
                "evidence_type"
            ]
            existing_item.source = seed_item["source"]
            existing_item.collected = seed_item["collected"]
            existing_item.analyst = seed_item["analyst"]
            existing_item.description = seed_item[
                "description"
            ]

            changed = True

    if changed:
        db.commit()


def evidence_to_dict(evidence: ForensicEvidence):
    return {
        "id": evidence.evidence_id,
        "evidence_id": evidence.evidence_id,
        "name": evidence.name,
        "status": evidence.status,
        "endpoint": evidence.endpoint,
        "evidence_type": evidence.evidence_type,
        "source": evidence.source,
        "collected": evidence.collected,
        "analyst": evidence.analyst,
        "description": evidence.description,
    }


@router.get("")
def read_all_forensic_evidence(
    db: Session = Depends(get_db),
):
    seed_evidence(db)

    statement = select(ForensicEvidence).order_by(
        ForensicEvidence.id.asc()
    )

    evidence = db.scalars(statement).all()

    return [
        evidence_to_dict(item)
        for item in evidence
    ]


@router.get(
    "/{evidence_id}",
    response_model=ForensicEvidenceResponse,
)
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
        raise HTTPException(
            status_code=404,
            detail="Forensic evidence not found",
        )

    return {
        "evidence_id": evidence.evidence_id,
        "name": evidence.name,
        "status": evidence.status,
        "endpoint": evidence.endpoint,
        "evidence_type": evidence.evidence_type,
        "source": evidence.source,
        "collected": evidence.collected,
        "analyst": evidence.analyst,
        "description": evidence.description,
        "correlations": CORRELATIONS.get(
            evidence_id,
            [],
        ),
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
        .where(
            ForensicAction.evidence_id == evidence_id
        )
        .order_by(
            ForensicAction.created_at.desc()
        )
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
        raise HTTPException(
            status_code=404,
            detail="Forensic evidence not found",
        )

    action = payload.action.upper().strip()

    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported forensic response action",
        )

    analyst = (
        payload.analyst.strip()
        or "SOC Analyst"
    )

    record = ForensicAction(
        action_id=(
            f"FORACT-{uuid4().hex[:8].upper()}"
        ),
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