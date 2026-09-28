from datetime import datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models.endpoint_activity import EndpointActivity


Base.metadata.create_all(bind=engine)


now = datetime.utcnow()


activity_data = [
    {
        "activity_id": "ACT-1001",
        "endpoint_id": "WIN-01",
        "title": "Authentication event detected",
        "description": "New authentication activity observed on endpoint.",
        "severity": "HIGH",
        "category": "Identity",
        "status": "REVIEW",
        "observed_at": now - timedelta(minutes=2),
    },
    {
        "activity_id": "ACT-1002",
        "endpoint_id": "WIN-01",
        "title": "Process activity recorded",
        "description": "New process execution recorded by endpoint agent.",
        "severity": "MEDIUM",
        "category": "Process",
        "status": "MONITORED",
        "observed_at": now - timedelta(minutes=8),
    },
    {
        "activity_id": "ACT-1003",
        "endpoint_id": "WIN-01",
        "title": "Network connection observed",
        "description": "Endpoint established an outbound network connection.",
        "severity": "LOW",
        "category": "Network",
        "status": "MONITORED",
        "observed_at": now - timedelta(minutes=14),
    },
    {
        "activity_id": "ACT-1004",
        "endpoint_id": "WIN-02",
        "title": "PowerShell execution detected",
        "description": "PowerShell activity was observed on the endpoint.",
        "severity": "HIGH",
        "category": "Execution",
        "status": "INVESTIGATING",
        "observed_at": now - timedelta(minutes=3),
    },
    {
        "activity_id": "ACT-1005",
        "endpoint_id": "WIN-02",
        "title": "Multiple authentication failures",
        "description": "Repeated authentication failures were detected.",
        "severity": "MEDIUM",
        "category": "Identity",
        "status": "BLOCKED",
        "observed_at": now - timedelta(minutes=9),
    },
    {
        "activity_id": "ACT-1006",
        "endpoint_id": "WIN-03",
        "title": "Administrative group change",
        "description": "New administrative group membership was observed.",
        "severity": "MEDIUM",
        "category": "Privilege",
        "status": "REVIEW",
        "observed_at": now - timedelta(minutes=5),
    },
    {
        "activity_id": "ACT-1007",
        "endpoint_id": "WIN-04",
        "title": "Unsigned process execution detected",
        "description": "An unsigned executable was observed running on the endpoint.",
        "severity": "HIGH",
        "category": "Process",
        "status": "INVESTIGATING",
        "observed_at": now - timedelta(minutes=4),
    },
    {
        "activity_id": "ACT-1008",
        "endpoint_id": "LINUX-01",
        "title": "External DNS request observed",
        "description": "A new external DNS request was observed.",
        "severity": "LOW",
        "category": "Network",
        "status": "MONITORED",
        "observed_at": now - timedelta(minutes=7),
    },
    {
        "activity_id": "ACT-1009",
        "endpoint_id": "SRV-DC01",
        "title": "Domain authentication activity",
        "description": "Authentication activity was recorded by the domain controller.",
        "severity": "LOW",
        "category": "Identity",
        "status": "NORMAL",
        "observed_at": now - timedelta(minutes=6),
    },
]


db = SessionLocal()

try:
    for item in activity_data:
        existing = (
            db.query(EndpointActivity)
            .filter(
                EndpointActivity.activity_id
                == item["activity_id"]
            )
            .first()
        )

        if existing:
            existing.endpoint_id = item["endpoint_id"]
            existing.title = item["title"]
            existing.description = item["description"]
            existing.severity = item["severity"]
            existing.category = item["category"]
            existing.status = item["status"]
            existing.observed_at = item["observed_at"]
        else:
            db.add(
                EndpointActivity(**item)
            )

    db.commit()

    print(
        "Endpoint security activity seeded successfully."
    )

finally:
    db.close()