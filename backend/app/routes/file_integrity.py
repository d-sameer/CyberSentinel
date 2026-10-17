from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.file_integrity import FileIntegrity


class FileIntegrityResponse(BaseModel):
    id: str
    fileName: str
    path: str
    endpoint: str
    user: str
    process: str
    status: str
    hashBefore: str
    hashAfter: str
    lastModified: str
    size: str
    fileType: str
    permissions: str
    signer: str
    detection: str
    networkActivity: str


router = APIRouter(
    prefix="/api/file-integrity",
    tags=["File Integrity"],
)


# ---------------------------------------------------------
# CORE DATABASE FIELDS
# ---------------------------------------------------------

SEED_FILES = [
    {
        "file_id": "FILE-001",
        "file_name": "hosts",
        "path": r"C:\Windows\System32\drivers\etc\hosts",
        "endpoint": "WIN-01",
        "user": "SYSTEM",
        "process": "svchost.exe",
        "status": "CLEAN",
        "hash_before": "7f3a...91bc",
        "hash_after": "7f3a...91bc",
        "last_modified": "Today, 08:42:12",
        "size": "1.2 KB",
    },
    {
        "file_id": "FILE-002",
        "file_name": "update.ps1",
        "path": r"C:\Users\Sameer\Downloads\update.ps1",
        "endpoint": "WIN-01",
        "user": "Sameer",
        "process": "powershell.exe",
        "status": "MODIFIED",
        "hash_before": "81c4...2fa1",
        "hash_after": "d92a...71e4",
        "last_modified": "Today, 10:04:29",
        "size": "8.4 KB",
    },
    {
        "file_id": "FILE-003",
        "file_name": "config.json",
        "path": r"C:\ProgramData\CyberSentinel\config.json",
        "endpoint": "WIN-02",
        "user": "SYSTEM",
        "process": "unknown_update.exe",
        "status": "MODIFIED",
        "hash_before": "12ab...9d20",
        "hash_after": "83fe...4c11",
        "last_modified": "Today, 10:24:03",
        "size": "4.8 KB",
    },
    {
        "file_id": "FILE-004",
        "file_name": "payload.bin",
        "path": (
            r"C:\Users\Sameer\AppData\Local\Temp\payload.bin"
        ),
        "endpoint": "WIN-02",
        "user": "Sameer",
        "process": "unknown_update.exe",
        "status": "CREATED",
        "hash_before": "-",
        "hash_after": "a91e...5f02",
        "last_modified": "Today, 10:24:09",
        "size": "182 KB",
    },
    {
        "file_id": "FILE-005",
        "file_name": "sshd_config",
        "path": "/etc/ssh/sshd_config",
        "endpoint": "LINUX-01",
        "user": "root",
        "process": "sshd",
        "status": "CLEAN",
        "hash_before": "a72c...44e1",
        "hash_after": "a72c...44e1",
        "last_modified": "Today, 08:43:17",
        "size": "3.1 KB",
    },
    {
        "file_id": "FILE-006",
        "file_name": "authorized_keys",
        "path": "/home/admin/.ssh/authorized_keys",
        "endpoint": "LINUX-01",
        "user": "admin",
        "process": "sshd",
        "status": "MODIFIED",
        "hash_before": "3ab1...a918",
        "hash_after": "8fe4...c220",
        "last_modified": "Today, 09:58:42",
        "size": "1.7 KB",
    },
    {
        "file_id": "FILE-007",
        "file_name": "startup.cmd",
        "path": r"C:\Users\Public\startup.cmd",
        "endpoint": "DEV-01",
        "user": "Sameer",
        "process": "cmd.exe",
        "status": "CREATED",
        "hash_before": "-",
        "hash_after": "c812...b991",
        "last_modified": "Today, 10:17:31",
        "size": "2.2 KB",
    },
    {
        "file_id": "FILE-008",
        "file_name": "temp_rules.xml",
        "path": r"C:\ProgramData\Security\temp_rules.xml",
        "endpoint": "WIN-02",
        "user": "SYSTEM",
        "process": "services.exe",
        "status": "DELETED",
        "hash_before": "c901...21fa",
        "hash_after": "-",
        "last_modified": "Today, 10:26:15",
        "size": "12.6 KB",
    },
]


# ---------------------------------------------------------
# ADDITIONAL FILE INVESTIGATION INFORMATION
# ---------------------------------------------------------

FILE_METADATA = {
    "FILE-001": {
        "fileType": "System configuration",
        "permissions": "SYSTEM / Administrator",
        "signer": "Microsoft Windows",
        "detection": "No integrity deviation detected.",
        "networkActivity": "No related network activity",
    },
    "FILE-002": {
        "fileType": "PowerShell Script",
        "permissions": "User",
        "signer": "Unsigned",
        "detection": (
            "File hash changed shortly after PowerShell "
            "execution with ExecutionPolicy Bypass."
        ),
        "networkActivity": (
            "Related outbound HTTPS activity observed"
        ),
    },
    "FILE-003": {
        "fileType": "JSON Configuration",
        "permissions": "SYSTEM",
        "signer": "Unsigned",
        "detection": (
            "Configuration file modified by a "
            "high-risk executable."
        ),
        "networkActivity": (
            "Outbound connection associated with "
            "modifying process"
        ),
    },
    "FILE-004": {
        "fileType": "Binary",
        "permissions": "User",
        "signer": "Unsigned",
        "detection": (
            "New binary created in a temporary directory "
            "by a high-risk process."
        ),
        "networkActivity": (
            "Network activity observed after file creation"
        ),
    },
    "FILE-005": {
        "fileType": "SSH Configuration",
        "permissions": "root",
        "signer": "Ubuntu System Package",
        "detection": "Expected baseline configuration.",
        "networkActivity": "Normal SSH service activity",
    },
    "FILE-006": {
        "fileType": "SSH Authorization File",
        "permissions": "admin",
        "signer": "N/A",
        "detection": (
            "SSH authorization file changed and requires "
            "administrator review."
        ),
        "networkActivity": (
            "Related SSH session activity detected"
        ),
    },
    "FILE-007": {
        "fileType": "Windows Command Script",
        "permissions": "User",
        "signer": "Unsigned",
        "detection": (
            "New command script created in a shared "
            "public directory."
        ),
        "networkActivity": (
            "No related network activity detected"
        ),
    },
    "FILE-008": {
        "fileType": "Security Rules",
        "permissions": "SYSTEM",
        "signer": "Microsoft Windows",
        "detection": (
            "Protected security rules file was deleted."
        ),
        "networkActivity": (
            "No related network activity detected"
        ),
    },
}


# ---------------------------------------------------------
# SEED DATABASE
# ---------------------------------------------------------

def seed_files(db: Session) -> None:
    existing = db.scalars(
        select(FileIntegrity)
    ).all()

    existing_by_id = {
        item.file_id: item
        for item in existing
    }

    changed = False

    for item in SEED_FILES:
        existing_item = existing_by_id.get(
            item["file_id"]
        )

        if existing_item is None:
            db.add(FileIntegrity(**item))
            changed = True
            continue

        for key, value in item.items():
            setattr(existing_item, key, value)

        changed = True

    if changed:
        db.commit()


# ---------------------------------------------------------
# CONVERT DATABASE OBJECT TO API RESPONSE
# ---------------------------------------------------------

def file_to_dict(
    file: FileIntegrity,
) -> dict:

    metadata = FILE_METADATA.get(
        file.file_id,
        {
            "fileType": "Unknown",
            "permissions": "Unknown",
            "signer": "Unknown",
            "detection": "No additional detection information",
            "networkActivity": "No related network activity",
        },
    )

    return {
        "id": file.file_id,
        "fileName": file.file_name,
        "path": file.path,
        "endpoint": file.endpoint,
        "user": file.user,
        "process": file.process,
        "status": file.status,
        "hashBefore": file.hash_before,
        "hashAfter": file.hash_after,
        "lastModified": file.last_modified,
        "size": file.size,
        "fileType": metadata["fileType"],
        "permissions": metadata["permissions"],
        "signer": metadata["signer"],
        "detection": metadata["detection"],
        "networkActivity": metadata["networkActivity"],
    }


# ---------------------------------------------------------
# GET ALL FILE INTEGRITY EVENTS
# ---------------------------------------------------------

@router.get("")
def get_file_integrity(
    db: Session = Depends(get_db),
):
    seed_files(db)

    statement = select(FileIntegrity).order_by(
        FileIntegrity.id.asc()
    )

    files = db.scalars(statement).all()

    return [
        file_to_dict(file)
        for file in files
    ]


# ---------------------------------------------------------
# GET SINGLE FILE INTEGRITY EVENT
# ---------------------------------------------------------

@router.get(
    "/{file_id}",
    response_model=FileIntegrityResponse,
)
def get_file_integrity_details(
    file_id: str,
    db: Session = Depends(get_db),
):
    seed_files(db)

    file = db.scalar(
        select(FileIntegrity).where(
            FileIntegrity.file_id == file_id.upper()
        )
    )

    if file is None:
        raise HTTPException(
            status_code=404,
            detail="File integrity event not found",
        )

    return file_to_dict(file)