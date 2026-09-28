from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.security_event import SecurityEventResponse
from app.services.event_service import (
    get_all_events,
    get_event_by_id,
)


router = APIRouter(
    prefix="/api/events",
    tags=["Security Events"],
)


@router.get(
    "",
    response_model=list[SecurityEventResponse],
)
def read_events(
    db: Session = Depends(get_db),
):
    return get_all_events(db)


@router.get(
    "/{event_id}",
    response_model=SecurityEventResponse,
)
def read_event(
    event_id: str,
    db: Session = Depends(get_db),
):
    event = get_event_by_id(
        db,
        event_id,
    )

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Security event not found",
        )

    return event