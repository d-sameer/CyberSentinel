from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.process import Process


router = APIRouter(
    prefix="/api/processes",
    tags=["Processes"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# SCHEMAS
# ============================================================

class ProcessCreate(BaseModel):
    process_id: str
    name: str
    pid: int
    endpoint: str
    user: str
    cpu: str
    memory: str
    parent: str
    command_line: str
    status: str


class ProcessUpdate(BaseModel):
    name: str | None = None
    pid: int | None = None
    endpoint: str | None = None
    user: str | None = None
    cpu: str | None = None
    memory: str | None = None
    parent: str | None = None
    command_line: str | None = None
    status: str | None = None


# ============================================================
# SEED DATA
# ============================================================

SEED_PROCESSES = [
    {
        "process_id": "PROC-001",
        "name": "explorer.exe",
        "pid": 2148,
        "endpoint": "WIN-01",
        "user": "SYSTEM",
        "cpu": "2.4%",
        "memory": "82 MB",
        "parent": "userinit.exe",
        "command_line": r"C:\Windows\explorer.exe",
        "status": "NORMAL",
    },
    {
        "process_id": "PROC-002",
        "name": "chrome.exe",
        "pid": 5840,
        "endpoint": "WIN-01",
        "user": "Sameer",
        "cpu": "8.7%",
        "memory": "412 MB",
        "parent": "explorer.exe",
        "command_line": (
            r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        ),
        "status": "NORMAL",
    },
    {
        "process_id": "PROC-003",
        "name": "powershell.exe",
        "pid": 7348,
        "endpoint": "WIN-01",
        "user": "Sameer",
        "cpu": "18.9%",
        "memory": "96 MB",
        "parent": "explorer.exe",
        "command_line": (
            "powershell.exe "
            "-ExecutionPolicy Bypass "
            "-File update.ps1"
        ),
        "status": "HIGH RISK",
    },
    {
        "process_id": "PROC-004",
        "name": "curl",
        "pid": 2217,
        "endpoint": "KALI-01",
        "user": "root",
        "cpu": "4.2%",
        "memory": "14 MB",
        "parent": "bash",
        "command_line": (
            "curl "
            "https://example-security-endpoint.test/api"
        ),
        "status": "SUSPICIOUS",
    },
    {
        "process_id": "PROC-005",
        "name": "systemd",
        "pid": 1,
        "endpoint": "LINUX-01",
        "user": "root",
        "cpu": "0.2%",
        "memory": "11 MB",
        "parent": "init",
        "command_line": "/sbin/init",
        "status": "NORMAL",
    },
    {
        "process_id": "PROC-006",
        "name": "svchost.exe",
        "pid": 1180,
        "endpoint": "WIN-02",
        "user": "SYSTEM",
        "cpu": "3.1%",
        "memory": "64 MB",
        "parent": "services.exe",
        "command_line": (
            r"C:\Windows\System32\svchost.exe -k netsvcs"
        ),
        "status": "NORMAL",
    },
    {
        "process_id": "PROC-007",
        "name": "unknown_update.exe",
        "pid": 9124,
        "endpoint": "WIN-02",
        "user": "Sameer",
        "cpu": "31.6%",
        "memory": "174 MB",
        "parent": "explorer.exe",
        "command_line": (
            r"C:\Users\Sameer\AppData\Local\Temp"
            r"\unknown_update.exe"
        ),
        "status": "HIGH RISK",
    },
    {
        "process_id": "PROC-008",
        "name": "Code.exe",
        "pid": 6432,
        "endpoint": "DEV-01",
        "user": "Sameer",
        "cpu": "11.3%",
        "memory": "356 MB",
        "parent": "explorer.exe",
        "command_line": (
            r"C:\Users\Sameer\AppData\Local\Programs"
            r"\Microsoft VS Code\Code.exe"
        ),
        "status": "NORMAL",
    },
]


# ============================================================
# SEED DATABASE
# ============================================================

def seed_processes(db: Session):
    existing = {
        row[0]
        for row in db.query(
            Process.process_id
        ).all()
    }

    created = 0

    for item in SEED_PROCESSES:
        if item["process_id"] in existing:
            continue

        db.add(Process(**item))
        created += 1

    if created:
        db.commit()

    return created


# ============================================================
# GET ALL PROCESSES
# ============================================================

@router.get("")
def get_processes(
    db: Session = Depends(get_db),
):
    seed_processes(db)

    records = (
        db.query(Process)
        .order_by(Process.id.asc())
        .all()
    )

    return records


# ============================================================
# GET PROCESS BY PROCESS ID
# ============================================================

@router.get("/{process_id}")
def get_process(
    process_id: str,
    db: Session = Depends(get_db),
):
    seed_processes(db)

    record = (
        db.query(Process)
        .filter(
            Process.process_id == process_id
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Process not found",
        )

    return record


# ============================================================
# CREATE PROCESS
# ============================================================

@router.post("")
def create_process(
    data: ProcessCreate,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Process)
        .filter(
            Process.process_id
            == data.process_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Process ID already exists",
        )

    record = Process(
        **data.model_dump()
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


# ============================================================
# UPDATE PROCESS
# ============================================================

@router.put("/{process_id}")
def update_process(
    process_id: str,
    data: ProcessUpdate,
    db: Session = Depends(get_db),
):
    record = (
        db.query(Process)
        .filter(
            Process.process_id == process_id
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Process not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)

    return record


# ============================================================
# DELETE PROCESS
# ============================================================

@router.delete("/{process_id}")
def delete_process(
    process_id: str,
    db: Session = Depends(get_db),
):
    record = (
        db.query(Process)
        .filter(
            Process.process_id == process_id
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Process not found",
        )

    db.delete(record)
    db.commit()

    return {
        "message": "Process deleted successfully",
        "process_id": process_id,
    }