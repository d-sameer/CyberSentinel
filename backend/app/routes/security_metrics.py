from collections import Counter
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert
from app.models.endpoint import Endpoint
from app.models.security_event import SecurityEvent


router = APIRouter(
    prefix="/api/security-metrics",
    tags=["Security Metrics"],
)


def normalize(value: str | None) -> str:
    return (value or "UNKNOWN").strip().upper()


def percentage(part: int, total: int) -> float:
    if total == 0:
        return 0.0

    return round((part / total) * 100, 1)


def calculate_security_score(
    critical: int,
    high: int,
    medium: int,
    low: int,
    total_events: int,
    high_risk_endpoints: int,
    total_endpoints: int,
) -> int:
    if total_events == 0 and total_endpoints == 0:
        return 100

    event_penalty = (
        (critical * 12)
        + (high * 6)
        + (medium * 2)
        + low
    )

    endpoint_penalty = high_risk_endpoints * 8

    denominator = max(total_events, 1)

    penalty_ratio = (
        (event_penalty / denominator)
        + (
            endpoint_penalty
            / max(total_endpoints, 1)
        )
    ) / 2

    score = round(100 - penalty_ratio)

    return max(0, min(100, score))


@router.get("")
def get_security_metrics(
    db: Session = Depends(get_db),
):
    """
    Return aggregated security metrics from the
    CyberSentinel operational database.
    """

    alerts = db.query(Alert).all()
    events = db.query(SecurityEvent).all()
    endpoints = db.query(Endpoint).all()

    # ---------------------------------------------------------
    # EVENT METRICS
    # ---------------------------------------------------------

    event_severity = Counter(
        normalize(event.severity)
        for event in events
    )

    event_status = Counter(
        normalize(event.status)
        for event in events
    )

    event_categories = Counter(
        event.category or "Unknown"
        for event in events
    )

    total_events = len(events)

    critical_events = event_severity["CRITICAL"]
    high_events = event_severity["HIGH"]
    medium_events = event_severity["MEDIUM"]
    low_events = event_severity["LOW"]
    info_events = event_severity["INFO"]

    # ---------------------------------------------------------
    # ALERT METRICS
    # ---------------------------------------------------------

    alert_severity = Counter(
        normalize(alert.severity)
        for alert in alerts
    )

    alert_status = Counter(
        normalize(alert.status)
        for alert in alerts
    )

    alert_categories = Counter(
        alert.category or "Unknown"
        for alert in alerts
    )

    total_alerts = len(alerts)

    critical_alerts = alert_severity["CRITICAL"]
    high_alerts = alert_severity["HIGH"]
    medium_alerts = alert_severity["MEDIUM"]
    low_alerts = alert_severity["LOW"]

    open_alerts = sum(
        1
        for alert in alerts
        if normalize(alert.status)
        in {
            "OPEN",
            "NEW",
            "INVESTIGATING",
            "INVESTIGATION_STARTED",
        }
    )

    reviewed_alerts = sum(
        1
        for alert in alerts
        if normalize(alert.status)
        in {
            "REVIEWED",
            "CLOSED",
            "RESOLVED",
        }
    )

    investigating_alerts = sum(
        1
        for alert in alerts
        if normalize(alert.status)
        in {
            "INVESTIGATING",
            "INVESTIGATION_STARTED",
        }
    )

    average_alert_confidence = round(
        sum(
            alert.confidence or 0
            for alert in alerts
        )
        / total_alerts,
        1,
    ) if total_alerts else 0.0

    # ---------------------------------------------------------
    # ENDPOINT METRICS
    # ---------------------------------------------------------

    endpoint_status = Counter(
        normalize(endpoint.status)
        for endpoint in endpoints
    )

    endpoint_risk = Counter(
        normalize(endpoint.risk_level)
        for endpoint in endpoints
    )

    total_endpoints = len(endpoints)

    online_endpoints = sum(
        1
        for endpoint in endpoints
        if normalize(endpoint.status)
        in {
            "ONLINE",
            "HEALTHY",
            "ACTIVE",
        }
    )

    warning_endpoints = sum(
        1
        for endpoint in endpoints
        if normalize(endpoint.status)
        in {
            "WARNING",
            "DEGRADED",
        }
    )

    offline_endpoints = sum(
        1
        for endpoint in endpoints
        if normalize(endpoint.status)
        in {
            "OFFLINE",
            "DISCONNECTED",
        }
    )

    high_risk_endpoints = sum(
        1
        for endpoint in endpoints
        if normalize(endpoint.risk_level)
        in {
            "CRITICAL",
            "HIGH",
        }
    )

    medium_risk_endpoints = sum(
        1
        for endpoint in endpoints
        if normalize(endpoint.risk_level)
        == "MEDIUM"
    )

    low_risk_endpoints = sum(
        1
        for endpoint in endpoints
        if normalize(endpoint.risk_level)
        == "LOW"
    )

    # ---------------------------------------------------------
    # SECURITY SCORE
    # ---------------------------------------------------------

    security_score = calculate_security_score(
        critical=critical_events,
        high=high_events,
        medium=medium_events,
        low=low_events,
        total_events=total_events,
        high_risk_endpoints=high_risk_endpoints,
        total_endpoints=total_endpoints,
    )

    if security_score >= 80:
        posture = "HEALTHY"
    elif security_score >= 60:
        posture = "GUARDED"
    elif security_score >= 40:
        posture = "ELEVATED"
    else:
        posture = "CRITICAL"

    # ---------------------------------------------------------
    # CATEGORY DISTRIBUTION
    # ---------------------------------------------------------

    category_distribution = [
        {
            "category": category,
            "count": count,
            "percentage": percentage(
                count,
                total_events,
            ),
        }
        for category, count in event_categories.most_common()
    ]

    # ---------------------------------------------------------
    # SEVERITY DISTRIBUTION
    # ---------------------------------------------------------

    severity_distribution = [
        {
            "severity": severity,
            "count": count,
            "percentage": percentage(
                count,
                total_events,
            ),
        }
        for severity, count in [
            ("CRITICAL", critical_events),
            ("HIGH", high_events),
            ("MEDIUM", medium_events),
            ("LOW", low_events),
            ("INFO", info_events),
        ]
        if count > 0
    ]

    # ---------------------------------------------------------
    # ALERT DISTRIBUTION
    # ---------------------------------------------------------

    alert_distribution = [
        {
            "severity": severity,
            "count": count,
            "percentage": percentage(
                count,
                total_alerts,
            ),
        }
        for severity, count in [
            ("CRITICAL", critical_alerts),
            ("HIGH", high_alerts),
            ("MEDIUM", medium_alerts),
            ("LOW", low_alerts),
        ]
        if count > 0
    ]

    # ---------------------------------------------------------
    # ENDPOINT RISK DISTRIBUTION
    # ---------------------------------------------------------

    endpoint_risk_distribution = [
        {
            "risk": risk,
            "count": count,
            "percentage": percentage(
                count,
                total_endpoints,
            ),
        }
        for risk, count in [
            ("CRITICAL", endpoint_risk["CRITICAL"]),
            ("HIGH", endpoint_risk["HIGH"]),
            ("MEDIUM", medium_risk_endpoints),
            ("LOW", low_risk_endpoints),
        ]
        if count > 0
    ]

    # ---------------------------------------------------------
    # TOP EVENT CATEGORIES
    # ---------------------------------------------------------

    top_categories = [
        {
            "category": category,
            "count": count,
        }
        for category, count
        in event_categories.most_common(8)
    ]

    # ---------------------------------------------------------
    # RECENT SECURITY ACTIVITY
    # ---------------------------------------------------------

    recent_events = sorted(
        events,
        key=lambda event: event.timestamp
        or datetime.min,
        reverse=True,
    )[:10]

    recent_activity = [
        {
            "id": event.event_id,
            "title": event.title,
            "severity": normalize(event.severity),
            "status": normalize(event.status),
            "category": event.category,
            "asset": event.asset,
            "source": event.source,
            "timestamp": (
                event.timestamp.isoformat()
                if event.timestamp
                else None
            ),
        }
        for event in recent_events
    ]

    # ---------------------------------------------------------
    # TOP RISK ENDPOINTS
    # ---------------------------------------------------------

    risk_order = {
        "CRITICAL": 4,
        "HIGH": 3,
        "MEDIUM": 2,
        "LOW": 1,
    }

    top_risk_endpoints = sorted(
        endpoints,
        key=lambda endpoint: (
            risk_order.get(
                normalize(endpoint.risk_level),
                0,
            ),
            endpoint.open_alerts or 0,
            endpoint.open_incidents or 0,
        ),
        reverse=True,
    )[:8]

    risk_assets = [
        {
            "endpoint_id": endpoint.endpoint_id,
            "hostname": endpoint.hostname,
            "risk": normalize(endpoint.risk_level),
            "status": normalize(endpoint.status),
            "open_alerts": endpoint.open_alerts or 0,
            "open_incidents": endpoint.open_incidents or 0,
            "ip_address": endpoint.ip_address,
        }
        for endpoint in top_risk_endpoints
    ]

    # ---------------------------------------------------------
    # REPORT SUMMARY
    # ---------------------------------------------------------

    report_summary = {
        "generated_at": datetime.utcnow().isoformat(),
        "data_sources": [
            "Security Events",
            "Alerts",
            "Endpoints",
        ],
        "total_records": (
            total_events
            + total_alerts
            + total_endpoints
        ),
        "security_score": security_score,
        "posture": posture,
    }

    return {
        "report_summary": report_summary,

        "security_score": {
            "score": security_score,
            "posture": posture,
        },

        "events": {
            "total": total_events,
            "critical": critical_events,
            "high": high_events,
            "medium": medium_events,
            "low": low_events,
            "info": info_events,
            "statuses": dict(event_status),
            "severity_distribution": severity_distribution,
            "category_distribution": category_distribution,
        },

        "alerts": {
            "total": total_alerts,
            "critical": critical_alerts,
            "high": high_alerts,
            "medium": medium_alerts,
            "low": low_alerts,
            "open": open_alerts,
            "investigating": investigating_alerts,
            "reviewed": reviewed_alerts,
            "average_confidence": average_alert_confidence,
            "statuses": dict(alert_status),
            "severity_distribution": alert_distribution,
            "category_distribution": [
                {
                    "category": category,
                    "count": count,
                }
                for category, count
                in alert_categories.most_common()
            ],
        },

        "endpoints": {
            "total": total_endpoints,
            "online": online_endpoints,
            "warning": warning_endpoints,
            "offline": offline_endpoints,
            "high_risk": high_risk_endpoints,
            "medium_risk": medium_risk_endpoints,
            "low_risk": low_risk_endpoints,
            "statuses": dict(endpoint_status),
            "risk_distribution": endpoint_risk_distribution,
        },

        "top_categories": top_categories,

        "recent_activity": recent_activity,

        "risk_assets": risk_assets,
    }