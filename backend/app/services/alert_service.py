from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.alert import Alert


def get_all_alerts(db: Session):
    statement = select(Alert).order_by(
        Alert.created_at.desc()
    )

    return db.scalars(statement).all()


def get_alert_by_id(
    db: Session,
    alert_id: str,
):
    statement = select(Alert).where(
        Alert.alert_id == alert_id
    )

    return db.scalar(statement)