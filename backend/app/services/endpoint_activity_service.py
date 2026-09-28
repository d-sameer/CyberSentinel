from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.endpoint_activity import EndpointActivity


def get_endpoint_activity(
    db: Session,
    endpoint_id: str,
):
    statement = (
        select(EndpointActivity)
        .where(
            EndpointActivity.endpoint_id == endpoint_id
        )
        .order_by(
            EndpointActivity.observed_at.desc()
        )
    )

    return db.scalars(statement).all()