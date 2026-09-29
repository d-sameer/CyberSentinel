from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import DateTime, Integer, String, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.database import Base, get_db


class FileIntegrityAction(Base):
    __tablename__ = "file_integrity_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    action_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    file_id: Mapped[str] = mapped_column(String(50), index=True)
    action: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(50), index=True)
    analyst: Mapped[str] = mapped_column(String(100), default="SOC Analyst")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class FileIntegrityActionRequest(BaseModel):
    action: str
    analyst: str = "SOC Analyst"


class FileIntegrityActionResponse(BaseModel):
    id: int
    action_id: str
    file_id: str
    action: str
    status: str
    analyst: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


router = APIRouter(
    prefix="/api/file-integrity",
    tags=["File Integrity Response"],
)


ALLOWED_ACTIONS = {
    "INVESTIGATE": "INVESTIGATION_STARTED",
    "PRESERVE_EVIDENCE": "EVIDENCE_PRESERVED",
    "QUARANTINE_FILE": "QUARANTINE_REQUESTED",
    "MARK_REVIEWED": "REVIEWED",
}


@router.get(
    "/{file_id}/actions",
    response_model=list[FileIntegrityActionResponse],
)
def read_file_integrity_actions(
    file_id: str,
    db: Session = Depends(get_db),
):
    statement = (
        select(FileIntegrityAction)
        .where(FileIntegrityAction.file_id == file_id)
        .order_by(FileIntegrityAction.created_at.desc())
    )
    return db.scalars(statement).all()


@router.post(
    "/{file_id}/actions",
    response_model=FileIntegrityActionResponse,
)
def create_file_integrity_action(
    file_id: str,
    payload: FileIntegrityActionRequest,
    db: Session = Depends(get_db),
):
    action = payload.action.upper().strip()

    if action not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file integrity response action",
        )

    analyst = payload.analyst.strip() or "SOC Analyst"

    record = FileIntegrityAction(
        action_id=f"FIACT-{uuid4().hex[:8].upper()}",
        file_id=file_id,
        action=action,
        status=ALLOWED_ACTIONS[action],
        analyst=analyst,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record
