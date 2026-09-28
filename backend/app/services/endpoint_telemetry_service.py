from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.endpoint_telemetry import EndpointTelemetry


def get_latest_telemetry(
    db: Session,
    endpoint_id: str,
):
    statement = (
        select(EndpointTelemetry)
        .where(
            EndpointTelemetry.endpoint_id == endpoint_id
        )
        .order_by(
            EndpointTelemetry.collected_at.desc()
        )
    )

    return db.scalars(statement).first()