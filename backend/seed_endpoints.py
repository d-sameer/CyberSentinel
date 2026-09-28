from datetime import datetime

from app.database import Base, SessionLocal, engine
from app.models.endpoint import Endpoint


Base.metadata.create_all(bind=engine)


endpoints = [
    {
        "endpoint_id": "WIN-01",
        "hostname": "WIN-01",
        "ip_address": "192.168.1.101",
        "operating_system": "Windows 11",
        "status": "ONLINE",
        "risk_level": "CRITICAL",
        "agent_status": "HEALTHY",
        "last_seen": datetime(2026, 9, 27, 22, 41, 8),
        "open_alerts": 3,
        "open_incidents": 1,
        "description": "Primary Windows workstation with active security investigation.",
    },
    {
        "endpoint_id": "WIN-02",
        "hostname": "WIN-02",
        "ip_address": "192.168.1.102",
        "operating_system": "Windows 11",
        "status": "ONLINE",
        "risk_level": "HIGH",
        "agent_status": "HEALTHY",
        "last_seen": datetime(2026, 9, 27, 22, 41, 5),
        "open_alerts": 4,
        "open_incidents": 2,
        "description": "Windows endpoint with authentication and PowerShell security activity.",
    },
    {
        "endpoint_id": "WIN-03",
        "hostname": "WIN-03",
        "ip_address": "192.168.1.103",
        "operating_system": "Windows 10",
        "status": "ONLINE",
        "risk_level": "MEDIUM",
        "agent_status": "HEALTHY",
        "last_seen": datetime(2026, 9, 27, 22, 40, 48),
        "open_alerts": 1,
        "open_incidents": 0,
        "description": "Administrative workstation monitored by CyberSentinel.",
    },
    {
        "endpoint_id": "WIN-04",
        "hostname": "WIN-04",
        "ip_address": "192.168.1.104",
        "operating_system": "Windows 11",
        "status": "ONLINE",
        "risk_level": "HIGH",
        "agent_status": "WARNING",
        "last_seen": datetime(2026, 9, 27, 22, 40, 54),
        "open_alerts": 2,
        "open_incidents": 1,
        "description": "Endpoint with unsigned process execution activity.",
    },
    {
        "endpoint_id": "LINUX-01",
        "hostname": "LINUX-01",
        "ip_address": "192.168.1.105",
        "operating_system": "Ubuntu 24.04",
        "status": "ONLINE",
        "risk_level": "LOW",
        "agent_status": "HEALTHY",
        "last_seen": datetime(2026, 9, 27, 22, 40, 31),
        "open_alerts": 0,
        "open_incidents": 0,
        "description": "Linux endpoint monitored for network and system activity.",
    },
    {
        "endpoint_id": "SRV-DC01",
        "hostname": "SRV-DC01",
        "ip_address": "192.168.1.10",
        "operating_system": "Windows Server 2022",
        "status": "ONLINE",
        "risk_level": "MEDIUM",
        "agent_status": "HEALTHY",
        "last_seen": datetime(2026, 9, 27, 22, 40, 28),
        "open_alerts": 1,
        "open_incidents": 0,
        "description": "Domain controller and core identity infrastructure server.",
    },
]


def seed_database():
    db = SessionLocal()

    try:
        inserted = 0
        skipped = 0

        for endpoint_data in endpoints:
            existing = (
                db.query(Endpoint)
                .filter(
                    Endpoint.endpoint_id
                    == endpoint_data["endpoint_id"]
                )
                .first()
            )

            if existing:
                skipped += 1
                continue

            endpoint = Endpoint(**endpoint_data)

            db.add(endpoint)
            inserted += 1

        db.commit()

        print("CyberSentinel endpoint seeding completed.")
        print(f"Inserted: {inserted}")
        print(f"Skipped:  {skipped}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()