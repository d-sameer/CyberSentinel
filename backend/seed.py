from datetime import datetime

from app.database import Base, SessionLocal, engine
from app.models.security_event import SecurityEvent


Base.metadata.create_all(bind=engine)


events = [
    {
        "event_id": "EVT-1048",
        "title": "Malicious outbound connection detected",
        "description": "A suspicious outbound HTTPS connection was detected from an endpoint running PowerShell.",
        "severity": "CRITICAL",
        "status": "INVESTIGATING",
        "category": "Network",
        "asset": "WIN-01",
        "source": "Network Sensor",
        "confidence": 98,
        "timestamp": datetime(2026, 9, 27, 22, 41, 8),
    },
    {
        "event_id": "EVT-1047",
        "title": "PowerShell execution policy bypass",
        "description": "PowerShell execution was observed with indicators consistent with an execution policy bypass.",
        "severity": "HIGH",
        "status": "ALERTED",
        "category": "Execution",
        "asset": "WIN-02",
        "source": "Endpoint Agent",
        "confidence": 94,
        "timestamp": datetime(2026, 9, 27, 22, 41, 5),
    },
    {
        "event_id": "EVT-1046",
        "title": "Multiple authentication failures",
        "description": "Repeated authentication failures were detected against an RDP service.",
        "severity": "MEDIUM",
        "status": "BLOCKED",
        "category": "Identity",
        "asset": "WIN-02",
        "source": "Identity Monitor",
        "confidence": 91,
        "timestamp": datetime(2026, 9, 27, 22, 40, 59),
    },
    {
        "event_id": "EVT-1045",
        "title": "Unsigned process execution detected",
        "description": "An unsigned executable was observed running from a non-standard location.",
        "severity": "HIGH",
        "status": "INVESTIGATING",
        "category": "Process",
        "asset": "WIN-04",
        "source": "EDR Sensor",
        "confidence": 89,
        "timestamp": datetime(2026, 9, 27, 22, 40, 54),
    },
    {
        "event_id": "EVT-1044",
        "title": "Endpoint heartbeat received",
        "description": "A normal endpoint heartbeat was received from the CyberSentinel agent.",
        "severity": "INFO",
        "status": "NORMAL",
        "category": "System",
        "asset": "WIN-03",
        "source": "Endpoint Agent",
        "confidence": 100,
        "timestamp": datetime(2026, 9, 27, 22, 40, 48),
    },
    {
        "event_id": "EVT-1043",
        "title": "Security file deletion attempt",
        "description": "A protected security-related file deletion attempt was detected and blocked.",
        "severity": "HIGH",
        "status": "BLOCKED",
        "category": "Defense Evasion",
        "asset": "WIN-02",
        "source": "File Integrity",
        "confidence": 96,
        "timestamp": datetime(2026, 9, 27, 22, 40, 42),
    },
    {
        "event_id": "EVT-1042",
        "title": "New administrative group membership",
        "description": "A user account was added to an administrative security group.",
        "severity": "MEDIUM",
        "status": "REVIEW",
        "category": "Privilege",
        "asset": "WIN-03",
        "source": "Identity Monitor",
        "confidence": 87,
        "timestamp": datetime(2026, 9, 27, 22, 40, 36),
    },
    {
        "event_id": "EVT-1041",
        "title": "New external DNS request observed",
        "description": "A new external DNS request was observed from a Linux endpoint.",
        "severity": "LOW",
        "status": "MONITORED",
        "category": "Network",
        "asset": "LINUX-01",
        "source": "Network Sensor",
        "confidence": 82,
        "timestamp": datetime(2026, 9, 27, 22, 40, 31),
    },
]


def seed_database():
    db = SessionLocal()

    try:
        inserted = 0
        skipped = 0

        for event_data in events:
            existing = (
                db.query(SecurityEvent)
                .filter(
                    SecurityEvent.event_id
                    == event_data["event_id"]
                )
                .first()
            )

            if existing:
                skipped += 1
                continue

            event = SecurityEvent(**event_data)

            db.add(event)
            inserted += 1

        db.commit()

        print("CyberSentinel database seeding completed.")
        print(f"Inserted: {inserted}")
        print(f"Skipped:  {skipped}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()