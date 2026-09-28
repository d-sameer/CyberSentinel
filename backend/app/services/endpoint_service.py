from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.endpoint import Endpoint


def get_all_endpoints(db: Session):
    statement = select(Endpoint).order_by(
        Endpoint.last_seen.desc()
    )

    return db.scalars(statement).all()


def get_endpoint_by_id(
    db: Session,
    endpoint_id: str,
):
    statement = select(Endpoint).where(
        Endpoint.endpoint_id == endpoint_id
    )

    return db.scalar(statement)