from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.endpoint_activity import (
    EndpointActivityResponse,
)
from app.services.endpoint_activity_service import (
    get_endpoint_activity,
)


router = APIRouter(
    prefix="/api/endpoints",
    tags=["Endpoint Activity"],
)


@router.get(
    "/{endpoint_id}/activity",
    response_model=list[EndpointActivityResponse],
)
def read_endpoint_activity(
    endpoint_id: str,
    db: Session = Depends(get_db),
):
    return get_endpoint_activity(
        db,
        endpoint_id,
    )