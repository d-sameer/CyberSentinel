from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert
from app.models.security_event import SecurityEvent

class DetectionRuleResponse(BaseModel):
    id: str
    name: str
    description: str
    category: str
    severity: str
    status: str
    technique: str
    techniqueName: str
    triggerCount: int
    lastTriggered: str
    source: str
    event_ids: list[str]
    alert_ids: list[str]
    incident_ids: list[str]

router = APIRouter(prefix="/api/detection-rules", tags=["Detection Rules"])

RULES = [
    {
        "id": "DET-001",
        "name": "PowerShell Execution Policy Bypass",
        "description": "Detects PowerShell execution using arguments that bypass the configured execution policy.",
        "category": "EXECUTION",
        "severity": "HIGH",
        "status": "ENABLED",
        "technique": "T1059.001",
        "techniqueName": "PowerShell",
        "triggerCount": 18,
        "lastTriggered": "Today, 10:06:14",
        "source": "Process Telemetry",
    },
    {
        "id": "DET-002",
        "name": "Suspicious Temporary Directory Execution",
        "description": "Detects executable files launched from user temporary directories.",
        "category": "EXECUTION",
        "severity": "HIGH",
        "status": "ENABLED",
        "technique": "T1204.002",
        "techniqueName": "Malicious File",
        "triggerCount": 7,
        "lastTriggered": "Today, 10:25:11",
        "source": "Endpoint Telemetry",
    },
    {
        "id": "DET-003",
        "name": "Multiple Authentication Failures",
        "description": "Detects repeated authentication failures from the same source within a short period.",
        "category": "CREDENTIAL ACCESS",
        "severity": "WARNING",
        "status": "ENABLED",
        "technique": "T1110",
        "techniqueName": "Brute Force",
        "triggerCount": 31,
        "lastTriggered": "Today, 10:27:12",
        "source": "Authentication Logs",
    },
    {
        "id": "DET-004",
        "name": "New Local Administrator",
        "description": "Detects accounts being added to privileged local administrator groups.",
        "category": "PRIVILEGE",
        "severity": "HIGH",
        "status": "ENABLED",
        "technique": "T1098",
        "techniqueName": "Account Manipulation",
        "triggerCount": 5,
        "lastTriggered": "Today, 10:18:33",
        "source": "Windows Security Logs",
    },
    {
        "id": "DET-005",
        "name": "Suspicious Outbound Connection",
        "description": "Detects outbound network connections associated with suspicious endpoint processes.",
        "category": "COMMAND AND CONTROL",
        "severity": "HIGH",
        "status": "ENABLED",
        "technique": "T1071.001",
        "techniqueName": "Web Protocols",
        "triggerCount": 12,
        "lastTriggered": "Today, 10:06:42",
        "source": "Network Telemetry",
    },
    {
        "id": "DET-006",
        "name": "Security File Deletion",
        "description": "Detects attempts to delete protected security monitoring or configuration files.",
        "category": "DEFENSE EVASION",
        "severity": "HIGH",
        "status": "ENABLED",
        "technique": "T1070.004",
        "techniqueName": "File Deletion",
        "triggerCount": 3,
        "lastTriggered": "Today, 10:26:39",
        "source": "File Integrity Monitoring",
    },
    {
        "id": "DET-007",
        "name": "SSH Authorized Keys Modification",
        "description": "Detects changes to SSH authorized_keys configuration files.",
        "category": "PERSISTENCE",
        "severity": "WARNING",
        "status": "ENABLED",
        "technique": "T1098.004",
        "techniqueName": "SSH Authorized Keys",
        "triggerCount": 4,
        "lastTriggered": "Today, 10:31:04",
        "source": "Linux Audit Logs",
    },
    {
        "id": "DET-008",
        "name": "Unsigned Binary Execution",
        "description": "Detects execution of unsigned binaries on monitored endpoints.",
        "category": "EXECUTION",
        "severity": "WARNING",
        "status": "ENABLED",
        "technique": "T1036",
        "techniqueName": "Masquerading",
        "triggerCount": 9,
        "lastTriggered": "Today, 10:25:11",
        "source": "Endpoint Telemetry",
    },
    {
        "id": "DET-009",
        "name": "Suspicious Service Creation",
        "description": "Detects creation of new services outside approved administrative workflows.",
        "category": "PERSISTENCE",
        "severity": "WARNING",
        "status": "DISABLED",
        "technique": "T1543.003",
        "techniqueName": "Windows Service",
        "triggerCount": 0,
        "lastTriggered": "Never",
        "source": "Windows System Logs",
    },
    {
        "id": "DET-010",
        "name": "Security Tool Process Termination",
        "description": "Detects attempts to terminate endpoint security or monitoring processes.",
        "category": "DEFENSE EVASION",
        "severity": "HIGH",
        "status": "ENABLED",
        "technique": "T1562.001",
        "techniqueName": "Impair Defenses",
        "triggerCount": 6,
        "lastTriggered": "Today, 09:48:22",
        "source": "Endpoint Telemetry",
    },
]

def _serialize(rule: dict, db: Session) -> dict:
    alerts = db.scalars(
        select(Alert).where(Alert.rule_id == rule["id"])
    ).all()

    alert_ids = [a.alert_id for a in alerts]

    # Alerts are the bridge from a detection rule into the security-event
    # correlation graph. The Alert database model does not store event_id or
    # incident_id directly; those relationships are stored on SecurityEvent.
    event_ids: list[str] = []
    incident_ids: list[str] = []

    for alert in alerts:
        events = db.scalars(
            select(SecurityEvent)
            .where(SecurityEvent.alert_id == alert.alert_id)
            .order_by(SecurityEvent.timestamp.desc())
        ).all()

        for event in events:
            event_ids.append(event.event_id)
            if event.incident_id:
                incident_ids.append(event.incident_id)

    # Preserve order while removing duplicates.
    event_ids = list(dict.fromkeys(event_ids))
    alert_ids = list(dict.fromkeys(alert_ids))
    incident_ids = list(dict.fromkeys(incident_ids))

    return {
        **rule,
        "event_ids": event_ids,
        "alert_ids": alert_ids,
        "incident_ids": incident_ids,
    }

@router.get("", response_model=list[DetectionRuleResponse])
def read_detection_rules(db: Session = Depends(get_db)):
    return [_serialize(rule, db) for rule in RULES]

@router.get("/{rule_id}", response_model=DetectionRuleResponse)
def read_detection_rule(rule_id: str, db: Session = Depends(get_db)):
    rule = next(
        (item for item in RULES if item["id"] == rule_id),
        None,
    )

    if rule is None:
        raise HTTPException(status_code=404, detail="Detection rule not found")

    return _serialize(rule, db)
