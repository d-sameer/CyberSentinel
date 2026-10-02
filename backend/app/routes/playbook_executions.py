from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.playbook import SecurityPlaybook
from app.models.playbook_execution import (
    SecurityPlaybookExecution,
)
from app.models.playbook_execution_step import (
    SecurityPlaybookExecutionStep,
)


router = APIRouter(
    prefix="/api/playbooks",
    tags=["Playbook Executions"],
)


class PlaybookExecutionRequest(BaseModel):
    target: str
    note: Optional[str] = ""


def execution_to_dict(
    execution: SecurityPlaybookExecution,
):
    return {
        "execution_id": execution.execution_id,
        "playbook_id": execution.playbook_id,
        "target": execution.target,
        "actor": execution.actor,
        "status": execution.status,
        "note": execution.note,
        "step_count": execution.step_count,
        "result": execution.result,
        "started_at": (
            execution.started_at.isoformat()
            if execution.started_at
            else None
        ),
        "completed_at": (
            execution.completed_at.isoformat()
            if execution.completed_at
            else None
        ),
    }


def step_to_dict(
    step: SecurityPlaybookExecutionStep,
):
    return {
        "step_number": step.step_number,
        "action": step.action,
        "status": step.status,
        "result": step.result,
        "started_at": (
            step.started_at.isoformat()
            if step.started_at
            else None
        ),
        "completed_at": (
            step.completed_at.isoformat()
            if step.completed_at
            else None
        ),
    }


@router.post(
    "/{playbook_id}/executions",
)
def execute_playbook(
    playbook_id: str,
    payload: PlaybookExecutionRequest,
    db: Session = Depends(get_db),
):
    playbook = (
        db.query(SecurityPlaybook)
        .filter(
            SecurityPlaybook.playbook_id
            == playbook_id
        )
        .first()
    )

    if not playbook:
        raise HTTPException(
            status_code=404,
            detail="Security playbook not found",
        )

    if playbook.status != "ENABLED":
        raise HTTPException(
            status_code=400,
            detail="Playbook is disabled and cannot be executed",
        )

    target = payload.target.strip()

    if not target:
        raise HTTPException(
            status_code=400,
            detail="Execution target is required",
        )

    actions = [
        item.strip()
        for item in playbook.actions.split("|")
        if item.strip()
    ]

    last_execution = (
        db.query(SecurityPlaybookExecution)
        .order_by(
            SecurityPlaybookExecution.id.desc()
        )
        .first()
    )

    if last_execution:
        next_number = last_execution.id + 1
    else:
        next_number = 1

    execution_id = f"EXE-{next_number:04d}"

    started_at = datetime.utcnow()

    execution = SecurityPlaybookExecution(
        execution_id=execution_id,
        playbook_id=playbook.playbook_id,
        target=target,
        actor="Security Admin",
        status="RUNNING",
        note=(payload.note or "").strip(),
        step_count=len(actions),
        result="Playbook execution started.",
        started_at=started_at,
        completed_at=started_at,
    )

    db.add(execution)
    db.flush()

    # The workflow is simulated safely. Each configured
    # playbook action receives its own persistent execution record.
    for index, action in enumerate(actions, start=1):
        step_started = datetime.utcnow()

        step = SecurityPlaybookExecutionStep(
            execution_id=execution_id,
            playbook_id=playbook.playbook_id,
            step_number=index,
            action=action,
            status="COMPLETED",
            result=(
                "Simulated automation step completed "
                "successfully."
            ),
            started_at=step_started,
            completed_at=datetime.utcnow(),
        )

        db.add(step)

    execution.status = "COMPLETED"

    execution.result = (
        "Playbook execution completed successfully. "
        f"{len(actions)} automation steps were simulated "
        "and recorded for investigation purposes."
    )

    execution.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(execution)

    return {
        **execution_to_dict(execution),
        "steps": [
            step_to_dict(step)
            for step in (
                db.query(
                    SecurityPlaybookExecutionStep
                )
                .filter(
                    SecurityPlaybookExecutionStep.execution_id
                    == execution_id
                )
                .order_by(
                    SecurityPlaybookExecutionStep.step_number.asc()
                )
                .all()
            )
        ],
    }


@router.get(
    "/{playbook_id}/executions",
)
def get_playbook_executions(
    playbook_id: str,
    db: Session = Depends(get_db),
):
    playbook = (
        db.query(SecurityPlaybook)
        .filter(
            SecurityPlaybook.playbook_id
            == playbook_id
        )
        .first()
    )

    if not playbook:
        raise HTTPException(
            status_code=404,
            detail="Security playbook not found",
        )

    executions = (
        db.query(SecurityPlaybookExecution)
        .filter(
            SecurityPlaybookExecution.playbook_id
            == playbook_id
        )
        .order_by(
            SecurityPlaybookExecution.id.desc()
        )
        .all()
    )

    return {
        "playbook_id": playbook_id,
        "total_executions": len(executions),
        "executions": [
            execution_to_dict(item)
            for item in executions
        ],
    }


@router.get(
    "/{playbook_id}/executions/{execution_id}",
)
def get_playbook_execution(
    playbook_id: str,
    execution_id: str,
    db: Session = Depends(get_db),
):
    execution = (
        db.query(SecurityPlaybookExecution)
        .filter(
            SecurityPlaybookExecution.playbook_id
            == playbook_id,
            SecurityPlaybookExecution.execution_id
            == execution_id,
        )
        .first()
    )

    if not execution:
        raise HTTPException(
            status_code=404,
            detail="Playbook execution not found",
        )

    steps = (
        db.query(
            SecurityPlaybookExecutionStep
        )
        .filter(
            SecurityPlaybookExecutionStep.execution_id
            == execution_id
        )
        .order_by(
            SecurityPlaybookExecutionStep.step_number.asc()
        )
        .all()
    )

    return {
        **execution_to_dict(execution),
        "steps": [
            step_to_dict(step)
            for step in steps
        ],
    }