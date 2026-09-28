from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.security_event import SecurityEvent


def get_all_events(db: Session):
    statement = select(SecurityEvent).order_by(
        SecurityEvent.timestamp.desc()
    )

    return db.scalars(statement).all()


def get_event_by_id(
    db: Session,
    event_id: str,
):
    statement = select(SecurityEvent).where(
        SecurityEvent.event_id == event_id
    )

    return db.scalar(statement)