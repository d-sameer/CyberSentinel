from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.endpoint_telemetry import (
    EndpointTelemetryResponse,
)
from app.services.endpoint_telemetry_service import (
    get_latest_telemetry,
)


router = APIRouter(
    prefix="/api/endpoints",
    tags=["Endpoint Telemetry"],
)


@router.get(
    "/{endpoint_id}/telemetry",
    response_model=EndpointTelemetryResponse,
)
def read_endpoint_telemetry(
    endpoint_id: str,
    db: Session = Depends(get_db),
):
    telemetry = get_latest_telemetry(
        db,
        endpoint_id,
    )

    if telemetry is None:
        raise HTTPException(
            status_code=404,
            detail="Endpoint telemetry not found",
        )

    return telemetry