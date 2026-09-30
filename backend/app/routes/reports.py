from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert
from app.models.compliance import ComplianceControl
from app.models.endpoint import Endpoint
from app.models.endpoint_activity import EndpointActivity
from app.models.endpoint_telemetry import EndpointTelemetry
from app.models.security_event import SecurityEvent


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)


def percentage(value: int, total: int) -> float:
    if total == 0:
        return 0.0

    return round((value / total) * 100, 1)


@router.get("")
def get_security_report(
    db: Session = Depends(get_db),
) -> dict[str, Any]:

    # ---------------------------------------------------------
    # Alerts
    # ---------------------------------------------------------

    alerts = db.query(Alert).all()

    total_alerts = len(alerts)

    critical_alerts = sum(
        1
        for alert in alerts
        if str(getattr(alert, "severity", "")).upper() == "CRITICAL"
    )

    high_alerts = sum(
        1
        for alert in alerts
        if str(getattr(alert, "severity", "")).upper() == "HIGH"
    )

    medium_alerts = sum(
        1
        for alert in alerts
        if str(getattr(alert, "severity", "")).upper() == "MEDIUM"
    )

    low_alerts = sum(
        1
        for alert in alerts
        if str(getattr(alert, "severity", "")).upper() == "LOW"
    )

    open_alerts = sum(
        1
        for alert in alerts
        if str(getattr(alert, "status", "")).upper()
        in {"OPEN", "NEW", "INVESTIGATING"}
    )

    resolved_alerts = sum(
        1
        for alert in alerts
        if str(getattr(alert, "status", "")).upper()
        in {"RESOLVED", "CLOSED"}
    )

    # ---------------------------------------------------------
    # Security Events
    # ---------------------------------------------------------

    events = db.query(SecurityEvent).all()

    total_events = len(events)

    critical_events = sum(
        1
        for event in events
        if str(getattr(event, "severity", "")).upper() == "CRITICAL"
    )

    high_events = sum(
        1
        for event in events
        if str(getattr(event, "severity", "")).upper() == "HIGH"
    )

    medium_events = sum(
        1
        for event in events
        if str(getattr(event, "severity", "")).upper() == "MEDIUM"
    )

    low_events = sum(
        1
        for event in events
        if str(getattr(event, "severity", "")).upper() == "LOW"
    )

    # ---------------------------------------------------------
    # Endpoints
    # ---------------------------------------------------------

    endpoints = db.query(Endpoint).all()

    total_endpoints = len(endpoints)

    online_endpoints = sum(
        1
        for endpoint in endpoints
        if str(getattr(endpoint, "status", "")).upper()
        in {"ONLINE", "ACTIVE", "HEALTHY"}
    )

    offline_endpoints = sum(
        1
        for endpoint in endpoints
        if str(getattr(endpoint, "status", "")).upper()
        in {"OFFLINE", "INACTIVE"}
    )

    # ---------------------------------------------------------
    # Endpoint telemetry
    # ---------------------------------------------------------

    telemetry = db.query(EndpointTelemetry).all()

    total_telemetry_records = len(telemetry)

    # ---------------------------------------------------------
    # Endpoint activity
    # ---------------------------------------------------------

    activities = db.query(EndpointActivity).all()

    total_endpoint_activity = len(activities)

    # ---------------------------------------------------------
    # Compliance
    # ---------------------------------------------------------

    controls = db.query(ComplianceControl).all()

    total_controls = len(controls)

    compliant_controls = sum(
        1
        for control in controls
        if str(getattr(control, "status", "")).upper()
        == "COMPLIANT"
    )

    non_compliant_controls = sum(
        1
        for control in controls
        if str(getattr(control, "status", "")).upper()
        == "NON_COMPLIANT"
    )

    partial_controls = sum(
        1
        for control in controls
        if str(getattr(control, "status", "")).upper()
        == "PARTIAL"
    )

    needs_review_controls = sum(
        1
        for control in controls
        if str(getattr(control, "status", "")).upper()
        == "NEEDS_REVIEW"
    )

    compliance_score = (
        round(
            (
                compliant_controls
                + (partial_controls * 0.5)
            )
            / total_controls
            * 100,
            1,
        )
        if total_controls
        else 100.0
    )

    # ---------------------------------------------------------
    # Report response
    # ---------------------------------------------------------

    return {
        "report": {
            "title": "CyberSentinel Security Operations Report",
            "description": (
                "Aggregated security posture and operational "
                "metrics from the CyberSentinel platform."
            ),
        },

        "executive_summary": {
            "total_alerts": total_alerts,
            "open_alerts": open_alerts,
            "resolved_alerts": resolved_alerts,
            "critical_alerts": critical_alerts,
            "high_alerts": high_alerts,
            "total_events": total_events,
            "critical_events": critical_events,
            "total_endpoints": total_endpoints,
            "online_endpoints": online_endpoints,
            "offline_endpoints": offline_endpoints,
            "compliance_score": compliance_score,
        },

        "alerts": {
            "total": total_alerts,
            "open": open_alerts,
            "resolved": resolved_alerts,
            "severity": {
                "critical": critical_alerts,
                "high": high_alerts,
                "medium": medium_alerts,
                "low": low_alerts,
            },
            "resolution_rate": percentage(
                resolved_alerts,
                total_alerts,
            ),
        },

        "events": {
            "total": total_events,
            "severity": {
                "critical": critical_events,
                "high": high_events,
                "medium": medium_events,
                "low": low_events,
            },
        },

        "endpoints": {
            "total": total_endpoints,
            "online": online_endpoints,
            "offline": offline_endpoints,
            "availability_rate": percentage(
                online_endpoints,
                total_endpoints,
            ),
            "telemetry_records": total_telemetry_records,
            "activity_records": total_endpoint_activity,
        },

        "compliance": {
            "score": compliance_score,
            "total_controls": total_controls,
            "compliant": compliant_controls,
            "non_compliant": non_compliant_controls,
            "partial": partial_controls,
            "needs_review": needs_review_controls,
            "compliance_rate": percentage(
                compliant_controls,
                total_controls,
            ),
        },

        "report_metadata": {
            "data_sources": [
                "alerts",
                "security_events",
                "endpoints",
                "endpoint_telemetry",
                "endpoint_activity",
                "compliance_controls",
            ],
        },
    }