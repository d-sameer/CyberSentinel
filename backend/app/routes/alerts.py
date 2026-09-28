from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.alert import AlertResponse
from app.services.alert_service import (
    get_alert_by_id,
    get_all_alerts,
)


router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"],
)


@router.get(
    "",
    response_model=list[AlertResponse],
)
def read_alerts(
    db: Session = Depends(get_db),
):
    return get_all_alerts(db)


@router.get(
    "/{alert_id}",
    response_model=AlertResponse,
)
def read_alert(
    alert_id: str,
    db: Session = Depends(get_db),
):
    alert = get_alert_by_id(
        db,
        alert_id,
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    return alert