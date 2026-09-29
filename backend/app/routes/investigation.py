from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.security_event import SecurityEvent
from app.routes.incidents import Incident
from app.routes.incident_actions import IncidentAction
from app.routes.response_actions import SOCEventAction

router = APIRouter(
    prefix="/api/incidents",
    tags=["Incident Investigation"],
)


def _parse_ids(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def _event_timeline_item(event: SecurityEvent) -> dict:
    return {
        "time": event.timestamp,
        "title": event.title,
        "description": event.description,
        "actor": event.source,
        "source": "EVENT",
        "reference_id": event.event_id,
    }


def _event_action_timeline_item(action: SOCEventAction) -> dict:
    return {
        "time": action.created_at,
        "title": f"Event response: {action.action.replace('_', ' ')}",
        "description": (
            f"Response action recorded for {action.event_id} "
            f"with status {action.status.replace('_', ' ')}."
        ),
        "actor": action.analyst,
        "source": "EVENT_ACTION",
        "reference_id": action.action_id,
    }


def _incident_action_timeline_item(action: IncidentAction) -> dict:
    return {
        "time": action.created_at,
        "title": f"Incident response: {action.action.replace('_', ' ')}",
        "description": (
            f"Incident response action recorded with status "
            f"{action.status.replace('_', ' ')}."
        ),
        "actor": action.analyst,
        "source": "INCIDENT_ACTION",
        "reference_id": action.action_id,
    }


def _incident_created_timeline_item(incident: Incident) -> dict:
    return {
        "time": incident.created_at,
        "title": "Incident created",
        "description": incident.description,
        "actor": "CyberSentinel",
        "source": "INCIDENT",
        "reference_id": incident.incident_id,
    }


@router.get("/{incident_id}/investigation")
def read_incident_investigation(
    incident_id: str,
    db: Session = Depends(get_db),
):
    incident = db.scalar(
        select(Incident).where(Incident.incident_id == incident_id)
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    event_ids = _parse_ids(incident.related_event_ids)
    alert_ids = _parse_ids(incident.related_alert_ids)

    events = []
    if event_ids:
        statement = select(SecurityEvent).where(
            SecurityEvent.event_id.in_(event_ids)
        )
        event_records = db.scalars(statement).all()

        event_by_id = {
            event.event_id: event
            for event in event_records
        }

        for event_id in event_ids:
            event = event_by_id.get(event_id)
            if event is not None:
                events.append(event)

    event_actions = []
    if event_ids:
        statement = (
            select(SOCEventAction)
            .where(SOCEventAction.event_id.in_(event_ids))
            .order_by(SOCEventAction.created_at.desc())
        )
        event_actions = db.scalars(statement).all()

    statement = (
        select(IncidentAction)
        .where(IncidentAction.incident_id == incident_id)
        .order_by(IncidentAction.created_at.desc())
    )
    incident_actions = db.scalars(statement).all()

    timeline = [
        _incident_created_timeline_item(incident),
        *[_event_timeline_item(event) for event in events],
        *[
            _event_action_timeline_item(action)
            for action in event_actions
        ],
        *[
            _incident_action_timeline_item(action)
            for action in incident_actions
        ],
    ]

    timeline.sort(
        key=lambda item: item["time"],
        reverse=True,
    )

    return {
        "incident": {
            "id": incident.id,
            "incident_id": incident.incident_id,
            "title": incident.title,
            "description": incident.description,
            "severity": incident.severity,
            "status": incident.status,
            "analyst": incident.analyst,
            "primary_asset": incident.primary_asset,
            "related_event_ids": event_ids,
            "related_alert_ids": alert_ids,
            "created_at": incident.created_at,
            "updated_at": incident.updated_at,
        },
        "events": [
            {
                "event_id": event.event_id,
                "title": event.title,
                "description": event.description,
                "severity": event.severity,
                "status": event.status,
                "category": event.category,
                "asset": event.asset,
                "source": event.source,
                "confidence": event.confidence,
                "alert_id": event.alert_id,
                "incident_id": event.incident_id,
                "timestamp": event.timestamp,
            }
            for event in events
        ],
        "alerts": alert_ids,
        "event_actions": [
            {
                "action_id": action.action_id,
                "event_id": action.event_id,
                "action": action.action,
                "status": action.status,
                "analyst": action.analyst,
                "created_at": action.created_at,
            }
            for action in event_actions
        ],
        "incident_actions": [
            {
                "id": action.id,
                "action_id": action.action_id,
                "incident_id": action.incident_id,
                "action": action.action,
                "status": action.status,
                "analyst": action.analyst,
                "created_at": action.created_at,
            }
            for action in incident_actions
        ],
        "timeline": timeline,
    }
