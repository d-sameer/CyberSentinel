from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.endpoint import EndpointResponse
from app.services.endpoint_service import (
    get_all_endpoints,
    get_endpoint_by_id,
)


router = APIRouter(
    prefix="/api/endpoints",
    tags=["Endpoints"],
)


@router.get(
    "",
    response_model=list[EndpointResponse],
)
def read_endpoints(
    db: Session = Depends(get_db),
):
    return get_all_endpoints(db)


@router.get(
    "/{endpoint_id}",
    response_model=EndpointResponse,
)
def read_endpoint(
    endpoint_id: str,
    db: Session = Depends(get_db),
):
    endpoint = get_endpoint_by_id(
        db,
        endpoint_id,
    )

    if endpoint is None:
        raise HTTPException(
            status_code=404,
            detail="Endpoint not found",
        )

    return endpoint