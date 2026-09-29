from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, Integer, String, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.database import Base, get_db
from app.models.alert import Alert
from app.models.security_event import SecurityEvent
from app.routes.incidents import Incident
from app.routes.vulnerabilities import Vulnerability


router = APIRouter(
    prefix="/api/security-posture",
    tags=["Security Posture"],
)


class SecurityPostureAction(Base):
    __tablename__ = "security_posture_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    action_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    action: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(50), index=True)
    analyst: Mapped[str] = mapped_column(String(100), default="SOC Analyst")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SecurityPostureActionRequest(BaseModel):
    action: str
    analyst: str = "SOC Analyst"


class SecurityPostureActionResponse(BaseModel):
    id: int
    action_id: str
    action: str
    status: str
    analyst: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


ALLOWED_ACTIONS = {
    "REVIEW_CRITICAL_RISKS": "CRITICAL_RISKS_REVIEW_REQUESTED",
    "ACKNOWLEDGE_REVIEW": "POSTURE_REVIEWED",
}


SEVERITY_WEIGHT = {
    "CRITICAL": 40,
    "HIGH": 30,
    "MEDIUM": 20,
    "LOW": 10,
    "INFO": 5,
}


def _severity(value: str | None) -> str:
    return str(value or "LOW").upper()


def _status_is_open(value: str | None) -> bool:
    return str(value or "").upper() in {
        "OPEN",
        "INVESTIGATING",
        "ALERTED",
        "REVIEW",
        "PATCH AVAILABLE",
    }


def _risk_level(score: int) -> str:
    if score >= 85:
        return "CRITICAL"
    if score >= 70:
        return "HIGH"
    if score >= 50:
        return "MEDIUM"
    return "LOW"


def _domain_score(records: list[tuple[str, str]]) -> int:
    if not records:
        return 20

    values = [SEVERITY_WEIGHT.get(_severity(severity), 10) for _, severity in records]
    score = min(100, max(values) + min(35, (len(values) - 1) * 8))
    return score


def _parse_ids(value: str | None) -> list[str]:
    return [item.strip() for item in str(value or "").split(",") if item.strip()]


def _risk_assets(
    events: list[SecurityEvent],
    alerts: list[Alert],
    incidents: list[Incident],
) -> list[dict]:
    assets: dict[str, dict] = {}

    def ensure(asset: str):
        if not asset:
            return
        if asset not in assets:
            assets[asset] = {
                "id": asset,
                "name": asset,
                "type": "Security Asset",
                "score": 0,
                "findings": 0,
                "primaryIssue": "Security activity detected",
            }

    for event in events:
        ensure(event.asset)
        if event.asset:
            assets[event.asset]["score"] += SEVERITY_WEIGHT.get(
                _severity(event.severity), 10
            )
            assets[event.asset]["findings"] += 1
            assets[event.asset]["primaryIssue"] = event.title

    for alert in alerts:
        ensure(alert.asset)
        if alert.asset:
            assets[alert.asset]["score"] += SEVERITY_WEIGHT.get(
                _severity(alert.severity), 10
            )
            assets[alert.asset]["findings"] += 1
            assets[alert.asset]["primaryIssue"] = alert.title

    for incident in incidents:
        ensure(incident.primary_asset)
        if incident.primary_asset:
            assets[incident.primary_asset]["score"] += SEVERITY_WEIGHT.get(
                _severity(incident.severity), 10
            )
            assets[incident.primary_asset]["findings"] += 1
            assets[incident.primary_asset]["primaryIssue"] = incident.title

            if str(incident.status).upper() in {"OPEN", "INVESTIGATING"}:
                assets[incident.primary_asset]["score"] += 10

    result = []

    for asset in assets.values():
        score = min(99, asset["score"])
        risk = _risk_level(score)

        if asset["name"].startswith("WIN-"):
            asset_type = "Windows Endpoint"
        elif asset["name"].startswith("LINUX-"):
            asset_type = "Linux Endpoint"
        elif asset["name"].startswith("APP-"):
            asset_type = "Application Server"
        else:
            asset_type = "Security Asset"

        result.append(
            {
                **asset,
                "type": asset_type,
                "risk": risk,
                "score": score,
                "route": (
                    f"/endpoints/{asset['name']}"
                    if asset["name"].startswith(("WIN-", "LINUX-", "KALI-", "DEV-"))
                    else "/vulnerabilities"
                ),
            }
        )

    result.sort(
        key=lambda item: (item["score"], item["findings"]),
        reverse=True,
    )
    return result[:8]


@router.get("")
def read_security_posture(db: Session = Depends(get_db)):
    events = db.scalars(
        select(SecurityEvent).order_by(SecurityEvent.timestamp.desc())
    ).all()

    alerts = db.scalars(
        select(Alert).order_by(Alert.created_at.desc())
    ).all()

    incidents = db.scalars(
        select(Incident).order_by(Incident.updated_at.desc())
    ).all()

    vulnerabilities = db.scalars(
        select(Vulnerability).order_by(Vulnerability.updated_at.desc())
    ).all()

    critical_events = sum(
        1 for item in events if _severity(item.severity) == "CRITICAL"
    )
    critical_alerts = sum(
        1 for item in alerts if _severity(item.severity) == "CRITICAL"
    )

    high_events = sum(
        1 for item in events if _severity(item.severity) == "HIGH"
    )
    high_alerts = sum(
        1 for item in alerts if _severity(item.severity) == "HIGH"
    )

    critical_risks = critical_events + critical_alerts
    high_risks = high_events + high_alerts

    open_vulnerabilities = sum(
        1
        for item in vulnerabilities
        if str(item.status).upper() in {"OPEN", "PATCH AVAILABLE"}
    )

    active_incidents = sum(
        1
        for item in incidents
        if str(item.status).upper() in {"OPEN", "INVESTIGATING"}
    )

    finding_severities = [
        _severity(item.severity)
        for item in events
    ] + [
        _severity(item.severity)
        for item in alerts
    ]

    vulnerability_severity = {
        "VULN-001": "CRITICAL",
        "VULN-002": "CRITICAL",
        "VULN-003": "CRITICAL",
        "VULN-004": "HIGH",
        "VULN-005": "HIGH",
    }

    finding_severities.extend(
        vulnerability_severity.get(item.vulnerability_id, "MEDIUM")
        for item in vulnerabilities
    )

    distribution = {
        "CRITICAL": sum(1 for item in finding_severities if item == "CRITICAL"),
        "HIGH": sum(1 for item in finding_severities if item == "HIGH"),
        "MEDIUM": sum(1 for item in finding_severities if item == "MEDIUM"),
        "LOW": sum(1 for item in finding_severities if item == "LOW"),
    }

    endpoint_records = [
        (item.asset, item.severity)
        for item in events
        if item.asset
    ] + [
        (item.asset, item.severity)
        for item in alerts
        if item.asset
    ]

    vulnerability_records = [
        (
            item.vulnerability_id,
            vulnerability_severity.get(item.vulnerability_id, "MEDIUM"),
        )
        for item in vulnerabilities
        if str(item.status).upper() in {"OPEN", "PATCH AVAILABLE"}
    ]

    identity_records = [
        (item.event_id, item.severity)
        for item in events
        if "IDENT" in str(item.category).upper()
        or "AUTH" in str(item.category).upper()
        or "LOGIN" in str(item.title).upper()
    ]

    network_records = [
        (item.event_id, item.severity)
        for item in events
        if "NETWORK" in str(item.category).upper()
        or "NETWORK" in str(item.source).upper()
        or "OUTBOUND" in str(item.title).upper()
    ]

    threat_records = [
        (item.event_id, item.severity)
        for item in events
        if "THREAT" in str(item.source).upper()
        or "IOC" in str(item.category).upper()
        or "MALICIOUS" in str(item.title).upper()
    ]

    incident_records = [
        (item.incident_id, item.severity)
        for item in incidents
        if str(item.status).upper() in {"OPEN", "INVESTIGATING"}
    ]

    domain_scores = {
        "Endpoint": _domain_score(endpoint_records),
        "Vulnerability": _domain_score(vulnerability_records),
        "Identity": _domain_score(identity_records),
        "Network": _domain_score(network_records),
        "Incidents": _domain_score(incident_records),
        "Threat Intel": _domain_score(threat_records),
    }

    weighted_score = round(
        sum(domain_scores.values()) / len(domain_scores)
    )

    overall_score = min(
        99,
        max(
            0,
            weighted_score
            + min(10, critical_risks * 2)
            + min(8, active_incidents),
        ),
    )

    recent_activity = []

    for event in events[:6]:
        recent_activity.append(
            {
                "id": event.event_id,
                "time": event.timestamp,
                "title": event.title,
                "description": event.description,
                "severity": _severity(event.severity),
                "route": f"/soc/events/{event.event_id}",
            }
        )

    for vulnerability in vulnerabilities[:3]:
        recent_activity.append(
            {
                "id": vulnerability.vulnerability_id,
                "time": vulnerability.updated_at,
                "title": f"{vulnerability.cve} vulnerability status",
                "description": (
                    f"{vulnerability.vulnerability_id} is currently "
                    f"{vulnerability.status}."
                ),
                "severity": vulnerability_severity.get(
                    vulnerability.vulnerability_id,
                    "MEDIUM",
                ),
                "route": (
                    f"/vulnerabilities/{vulnerability.vulnerability_id}"
                ),
            }
        )

    recent_activity.sort(
        key=lambda item: str(item["time"]),
        reverse=True,
    )

    actions = db.scalars(
        select(SecurityPostureAction)
        .order_by(SecurityPostureAction.created_at.desc())
        .limit(10)
    ).all()

    return {
        "status": "BACKEND CONNECTED",
        "generated_at": datetime.utcnow(),
        "overall": {
            "score": overall_score,
            "label": (
                "CRITICAL"
                if overall_score >= 85
                else "ELEVATED"
                if overall_score >= 70
                else "HEALTHY"
            ),
        },
        "metrics": {
            "critical_risks": critical_risks,
            "high_risks": high_risks,
            "open_vulnerabilities": open_vulnerabilities,
            "active_incidents": active_incidents,
        },
        "domains": [
            {
                "label": label,
                "score": score,
                "risk": _risk_level(score),
            }
            for label, score in domain_scores.items()
        ],
        "risk_distribution": distribution,
        "total_findings": sum(distribution.values()),
        "risk_assets": _risk_assets(events, alerts, incidents),
        "recent_activity": recent_activity[:8],
        "actions": [
            {
                "action_id": action.action_id,
                "action": action.action,
                "status": action.status,
                "analyst": action.analyst,
                "created_at": action.created_at,
            }
            for action in actions
        ],
    }


@router.get(
    "/actions",
    response_model=list[SecurityPostureActionResponse],
)
def read_security_posture_actions(
    db: Session = Depends(get_db),
):
    statement = (
        select(SecurityPostureAction)
        .order_by(SecurityPostureAction.created_at.desc())
    )
    return db.scalars(statement).all()


@router.post(
    "/actions",
    response_model=SecurityPostureActionResponse,
)
def create_security_posture_action(
    payload: SecurityPostureActionRequest,
    db: Session = Depends(get_db),
):
    action = payload.action.upper().strip()

    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported security posture action",
        )

    analyst = payload.analyst.strip() or "SOC Analyst"

    record = SecurityPostureAction(
        action_id=f"POSTUREACT-{uuid4().hex[:8].upper()}",
        action=action,
        status=ALLOWED_ACTIONS[action],
        analyst=analyst,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record