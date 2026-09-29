from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, Integer, String, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.database import Base, get_db


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    log_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    timestamp: Mapped[str] = mapped_column(String(100))
    action: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(50), index=True)
    severity: Mapped[str] = mapped_column(String(20), index=True)
    status: Mapped[str] = mapped_column(String(30), index=True)
    user: Mapped[str] = mapped_column(String(100))
    endpoint: Mapped[str] = mapped_column(String(100), index=True)
    source_ip: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(1000))
    event_source: Mapped[str] = mapped_column(String(255))
    process: Mapped[str] = mapped_column(String(255))
    pid: Mapped[str] = mapped_column(String(50))
    command: Mapped[str] = mapped_column(String(1000))
    related_file: Mapped[str] = mapped_column(String(500))
    network_activity: Mapped[str] = mapped_column(String(1000))
    event_code: Mapped[str] = mapped_column(String(100))
    assessment: Mapped[str] = mapped_column(String(1500))


class AuditLogAction(Base):
    __tablename__ = "audit_log_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    action_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    log_id: Mapped[str] = mapped_column(String(50), index=True)
    action: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(50), index=True)
    analyst: Mapped[str] = mapped_column(String(100), default="SOC Analyst")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AuditLogActionRequest(BaseModel):
    action: str
    analyst: str = "SOC Analyst"


class AuditLogActionResponse(BaseModel):
    id: int
    action_id: str
    log_id: str
    action: str
    status: str
    analyst: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs Response"])


SEED_AUDIT_LOGS = [
    {
        "log_id": "LOG-001", "timestamp": "Today, 10:06:14",
        "action": "PowerShell Execution", "category": "SECURITY",
        "severity": "HIGH", "status": "REVIEW", "user": "Sameer",
        "endpoint": "WIN-01", "source_ip": "192.168.1.101",
        "description": "PowerShell launched with ExecutionPolicy Bypass and executed update.ps1.",
        "event_source": "Windows PowerShell Operational Log",
        "process": "powershell.exe", "pid": "7348",
        "command": "powershell.exe -ExecutionPolicy Bypass -File update.ps1",
        "related_file": "update.ps1",
        "network_activity": "Outbound HTTPS connection observed after execution",
        "event_code": "4104",
        "assessment": "The event requires investigation because PowerShell was executed with an ExecutionPolicy Bypass argument and launched a script.",
    },
    {
        "log_id": "LOG-002", "timestamp": "Today, 10:05:58",
        "action": "User Login", "category": "AUTH", "severity": "INFO",
        "status": "SUCCESS", "user": "Sameer", "endpoint": "WIN-01",
        "source_ip": "192.168.1.101",
        "description": "Interactive user authentication completed successfully.",
        "event_source": "Windows Security Event Log", "process": "winlogon.exe",
        "pid": "1184", "command": "Interactive logon session",
        "related_file": "Security.evtx", "network_activity": "Local authentication session",
        "event_code": "4624",
        "assessment": "The authentication event was successful and currently has no additional suspicious indicators.",
    },
    {
        "log_id": "LOG-003", "timestamp": "Today, 10:06:42",
        "action": "Outbound Connection", "category": "SECURITY",
        "severity": "HIGH", "status": "REVIEW", "user": "Sameer",
        "endpoint": "WIN-01", "source_ip": "192.168.1.101",
        "description": "Outbound HTTPS connection observed after suspicious process execution.",
        "event_source": "Network Security Telemetry", "process": "powershell.exe",
        "pid": "7348", "command": "powershell.exe -ExecutionPolicy Bypass -File update.ps1",
        "related_file": "update.ps1",
        "network_activity": "WIN-01 → 203.0.113.45:443 / HTTPS",
        "event_code": "NET-HTTPS-443",
        "assessment": "The connection occurred shortly after suspicious PowerShell activity and should be correlated with the process and file timeline.",
    },
    {
        "log_id": "LOG-004", "timestamp": "Today, 10:18:33",
        "action": "Privilege Change", "category": "ADMIN",
        "severity": "WARNING", "status": "REVIEW", "user": "admin",
        "endpoint": "LINUX-01", "source_ip": "192.168.1.104",
        "description": "Administrative privileges were assigned to an existing account.",
        "event_source": "Linux Authentication and Audit Logs", "process": "usermod",
        "pid": "2281", "command": "usermod -aG sudo admin",
        "related_file": "/etc/group",
        "network_activity": "SSH session from 192.168.1.104",
        "event_code": "USERMOD-ADMIN",
        "assessment": "The privilege change should be validated against the expected administrative workflow for this endpoint.",
    },
    {
        "log_id": "LOG-005", "timestamp": "Today, 10:25:11",
        "action": "Unknown Binary Execution", "category": "SECURITY",
        "severity": "HIGH", "status": "REVIEW", "user": "Sameer",
        "endpoint": "WIN-02", "source_ip": "192.168.1.103",
        "description": "Unsigned executable launched from the user temporary directory.",
        "event_source": "Endpoint Process Telemetry", "process": "unknown_update.exe",
        "pid": "9124",
        "command": r"C:\Users\Sameer\AppData\Local\Temp\unknown_update.exe",
        "related_file": "unknown_update.exe",
        "network_activity": "Outbound connection associated with process",
        "event_code": "PROC-EXEC-UNSIGNED",
        "assessment": "Execution from a temporary directory combined with an unsigned binary requires additional endpoint investigation.",
    },
    {
        "log_id": "LOG-006", "timestamp": "Today, 10:26:39",
        "action": "Security File Deletion", "category": "SECURITY",
        "severity": "HIGH", "status": "BLOCKED", "user": "SYSTEM",
        "endpoint": "WIN-02", "source_ip": "192.168.1.103",
        "description": "Protected security configuration file deletion was blocked.",
        "event_source": "File Integrity Monitoring", "process": "services.exe",
        "pid": "1180", "command": "services.exe -k security-monitor",
        "related_file": r"C:\ProgramData\Security\temp_rules.xml",
        "network_activity": "No related network activity",
        "event_code": "FIM-DELETE-BLOCK",
        "assessment": "The deletion attempt was blocked by file integrity controls. The originating process should still be reviewed.",
    },
    {
        "log_id": "LOG-007", "timestamp": "Today, 10:27:12",
        "action": "Authentication Failure", "category": "AUTH",
        "severity": "WARNING", "status": "REVIEW", "user": "unknown",
        "endpoint": "WIN-02", "source_ip": "10.0.0.45",
        "description": "Multiple failed authentication attempts were recorded.",
        "event_source": "Windows Security Event Log", "process": "winlogon.exe",
        "pid": "1224", "command": "Interactive authentication",
        "related_file": "Security.evtx",
        "network_activity": "Authentication requests from 10.0.0.45",
        "event_code": "4625",
        "assessment": "Repeated authentication failures from the same source should be correlated with account activity and network telemetry.",
    },
    {
        "log_id": "LOG-008", "timestamp": "Today, 10:31:04",
        "action": "SSH Key Modification", "category": "ADMIN",
        "severity": "WARNING", "status": "SUCCESS", "user": "admin",
        "endpoint": "LINUX-01", "source_ip": "192.168.1.104",
        "description": "authorized_keys configuration was modified during an SSH session.",
        "event_source": "Linux Audit Telemetry", "process": "sshd",
        "pid": "2441", "command": "ssh admin@192.168.1.104",
        "related_file": "/home/admin/.ssh/authorized_keys",
        "network_activity": "SSH connection over TCP/22",
        "event_code": "SSH-KEY-MOD",
        "assessment": "The change was recorded successfully and should be validated against the expected SSH administration activity.",
    },
    {
        "log_id": "LOG-009", "timestamp": "Today, 10:42:18",
        "action": "Endpoint Policy Update", "category": "ADMIN",
        "severity": "INFO", "status": "SUCCESS", "user": "SOC Analyst",
        "endpoint": "WIN-01", "source_ip": "192.168.1.10",
        "description": "Endpoint monitoring policy was updated successfully.",
        "event_source": "CyberSentinel Management Console",
        "process": "CyberSentinelAgent.exe", "pid": "4512",
        "command": "CyberSentinelAgent.exe --policy-update",
        "related_file": "endpoint-policy.json",
        "network_activity": "Management API connection",
        "event_code": "POLICY-UPDATE",
        "assessment": "The policy update was successfully applied through the security management workflow.",
    },
    {
        "log_id": "LOG-010", "timestamp": "Today, 10:48:51",
        "action": "System Service Start", "category": "SYSTEM",
        "severity": "INFO", "status": "SUCCESS", "user": "SYSTEM",
        "endpoint": "WIN-02", "source_ip": "192.168.1.103",
        "description": "Windows security monitoring service started successfully.",
        "event_source": "Windows System Event Log", "process": "services.exe",
        "pid": "1180", "command": "services.exe -start SecurityMonitor",
        "related_file": "SecurityMonitor.exe",
        "network_activity": "No immediate network activity",
        "event_code": "SERVICE-START",
        "assessment": "The service start event is consistent with normal endpoint monitoring activity.",
    },
]

ALLOWED_ACTIONS = {
    "START_INVESTIGATION": "INVESTIGATION_STARTED",
    "PRESERVE_EVENT": "EVENT_DATA_PRESERVED",
    "CORRELATE_ACTIVITY": "ACTIVITY_CORRELATED",
    "MARK_REVIEWED": "REVIEWED",
}


def seed_audit_logs(db: Session) -> None:
    existing = set(db.scalars(select(AuditLog.log_id)).all())
    created = False

    for item in SEED_AUDIT_LOGS:
        if item["log_id"] not in existing:
            db.add(AuditLog(**item))
            created = True

    if created:
        db.commit()


@router.get("/{log_id}")
def read_audit_log(log_id: str, db: Session = Depends(get_db)):
    seed_audit_logs(db)
    record = db.scalar(select(AuditLog).where(AuditLog.log_id == log_id))

    if record is None:
        raise HTTPException(status_code=404, detail="Audit log not found")

    return {
        "id": record.log_id,
        "timestamp": record.timestamp,
        "action": record.action,
        "category": record.category,
        "severity": record.severity,
        "status": record.status,
        "user": record.user,
        "endpoint": record.endpoint,
        "sourceIp": record.source_ip,
        "description": record.description,
        "eventSource": record.event_source,
        "process": record.process,
        "pid": record.pid,
        "command": record.command,
        "relatedFile": record.related_file,
        "networkActivity": record.network_activity,
        "eventCode": record.event_code,
        "assessment": record.assessment,
    }


@router.get("/{log_id}/actions", response_model=list[AuditLogActionResponse])
def read_audit_log_actions(log_id: str, db: Session = Depends(get_db)):
    statement = (
        select(AuditLogAction)
        .where(AuditLogAction.log_id == log_id)
        .order_by(AuditLogAction.created_at.desc())
    )
    return db.scalars(statement).all()


@router.post("/{log_id}/actions", response_model=AuditLogActionResponse)
def create_audit_log_action(
    log_id: str,
    payload: AuditLogActionRequest,
    db: Session = Depends(get_db),
):
    seed_audit_logs(db)
    record = db.scalar(select(AuditLog).where(AuditLog.log_id == log_id))

    if record is None:
        raise HTTPException(status_code=404, detail="Audit log not found")

    action = payload.action.upper().strip()

    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported audit log response action",
        )

    action_record = AuditLogAction(
        action_id=f"AUDITACT-{uuid4().hex[:8].upper()}",
        log_id=log_id,
        action=action,
        status=ALLOWED_ACTIONS[action],
        analyst=payload.analyst.strip() or "SOC Analyst",
    )

    if action == "MARK_REVIEWED":
        record.status = "REVIEWED"

    db.add(action_record)
    db.commit()
    db.refresh(action_record)

    return action_record
