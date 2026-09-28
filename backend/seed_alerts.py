from datetime import datetime

from app.database import Base, SessionLocal, engine
from app.models.alert import Alert


Base.metadata.create_all(bind=engine)


alerts = [
    {
        "alert_id": "ALT-018",
        "title": "Malicious outbound connection detected",
        "description": (
            "Suspicious outbound HTTPS communication was detected "
            "from WIN-01 and correlated with PowerShell activity."
        ),
        "severity": "CRITICAL",
        "status": "INVESTIGATING",
        "category": "Network",
        "source": "Network Sensor",
        "asset": "WIN-01",
        "rule_id": "DET-005",
        "confidence": 98,
        "created_at": datetime(2026, 9, 27, 22, 41, 8),
    },
    {
        "alert_id": "ALT-021",
        "title": "PowerShell execution policy bypass",
        "description": (
            "PowerShell execution with policy bypass indicators "
            "was detected on WIN-02."
        ),
        "severity": "HIGH",
        "status": "ALERTED",
        "category": "Execution",
        "source": "Endpoint Agent",
        "asset": "WIN-02",
        "rule_id": "DET-001",
        "confidence": 94,
        "created_at": datetime(2026, 9, 27, 22, 41, 5),
    },
    {
        "alert_id": "ALT-007",
        "title": "Multiple authentication failures",
        "description": (
            "Repeated failed RDP authentication attempts "
            "were detected against WIN-02."
        ),
        "severity": "MEDIUM",
        "status": "BLOCKED",
        "category": "Identity",
        "source": "Identity Monitor",
        "asset": "WIN-02",
        "rule_id": "DET-003",
        "confidence": 91,
        "created_at": datetime(2026, 9, 27, 22, 40, 59),
    },
    {
        "alert_id": "ALT-031",
        "title": "Unsigned process execution detected",
        "description": (
            "An unsigned executable was observed running "
            "from a non-standard location on WIN-04."
        ),
        "severity": "HIGH",
        "status": "INVESTIGATING",
        "category": "Process",
        "source": "EDR Sensor",
        "asset": "WIN-04",
        "rule_id": "DET-008",
        "confidence": 89,
        "created_at": datetime(2026, 9, 27, 22, 40, 54),
    },
    {
        "alert_id": "ALT-034",
        "title": "Security file deletion attempt",
        "description": (
            "A protected security-related file deletion "
            "attempt was detected and blocked."
        ),
        "severity": "HIGH",
        "status": "BLOCKED",
        "category": "Defense Evasion",
        "source": "File Integrity",
        "asset": "WIN-02",
        "rule_id": "DET-011",
        "confidence": 96,
        "created_at": datetime(2026, 9, 27, 22, 40, 42),
    },
    {
        "alert_id": "ALT-037",
        "title": "New administrative group membership",
        "description": (
            "A user account was added to an administrative "
            "security group on WIN-03."
        ),
        "severity": "MEDIUM",
        "status": "REVIEW",
        "category": "Privilege",
        "source": "Identity Monitor",
        "asset": "WIN-03",
        "rule_id": "DET-014",
        "confidence": 87,
        "created_at": datetime(2026, 9, 27, 22, 40, 36),
    },
]


def seed_database():
    db = SessionLocal()

    try:
        inserted = 0
        skipped = 0

        for alert_data in alerts:
            existing = (
                db.query(Alert)
                .filter(
                    Alert.alert_id
                    == alert_data["alert_id"]
                )
                .first()
            )

            if existing:
                skipped += 1
                continue

            alert = Alert(**alert_data)

            db.add(alert)
            inserted += 1

        db.commit()

        print("CyberSentinel alert seeding completed.")
        print(f"Inserted: {inserted}")
        print(f"Skipped:  {skipped}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()