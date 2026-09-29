from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.security_event import SecurityEvent


def _serialize_alert(db: Session, alert: Alert) -> dict:
    event_statement = (
        select(SecurityEvent)
        .where(SecurityEvent.alert_id == alert.alert_id)
        .order_by(SecurityEvent.timestamp.desc())
        .limit(1)
    )

    event = db.scalar(event_statement)

    return {
        "id": alert.id,
        "alert_id": alert.alert_id,
        "title": alert.title,
        "description": alert.description,
        "severity": alert.severity,
        "status": alert.status,
        "category": alert.category,
        "source": alert.source,
        "asset": alert.asset,
        "rule_id": alert.rule_id,
        "confidence": alert.confidence,
        "created_at": alert.created_at,
        "event_id": event.event_id if event else None,
        "incident_id": event.incident_id if event else None,
    }


def get_all_alerts(db: Session):
    statement = select(Alert).order_by(
        Alert.created_at.desc()
    )

    alerts = db.scalars(statement).all()

    return [
        _serialize_alert(db, alert)
        for alert in alerts
    ]


def get_alert_by_id(
    db: Session,
    alert_id: str,
):
    statement = select(Alert).where(
        Alert.alert_id == alert_id
    )

    alert = db.scalar(statement)

    if alert is None:
        return None

    return _serialize_alert(db, alert)
