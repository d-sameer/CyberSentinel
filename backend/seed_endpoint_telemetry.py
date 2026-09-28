from datetime import datetime

from app.database import Base, SessionLocal, engine
from app.models.endpoint import Endpoint
from app.models.endpoint_telemetry import EndpointTelemetry


Base.metadata.create_all(bind=engine)


telemetry_data = [
    {
        "endpoint_id": "WIN-01",
        "cpu_usage": 24.0,
        "memory_usage": 58.0,
        "disk_usage": 41.0,
        "gateway": "192.168.1.1",
        "dns_server": "192.168.1.1",
        "network_status": "CONNECTED",
    },
    {
        "endpoint_id": "WIN-02",
        "cpu_usage": 72.0,
        "memory_usage": 81.0,
        "disk_usage": 78.0,
        "gateway": "192.168.1.1",
        "dns_server": "192.168.1.1",
        "network_status": "CONNECTED",
    },
    {
        "endpoint_id": "WIN-03",
        "cpu_usage": 42.0,
        "memory_usage": 61.0,
        "disk_usage": 55.0,
        "gateway": "192.168.1.1",
        "dns_server": "192.168.1.1",
        "network_status": "CONNECTED",
    },
    {
        "endpoint_id": "WIN-04",
        "cpu_usage": 64.0,
        "memory_usage": 73.0,
        "disk_usage": 69.0,
        "gateway": "192.168.1.1",
        "dns_server": "192.168.1.1",
        "network_status": "CONNECTED",
    },
    {
        "endpoint_id": "LINUX-01",
        "cpu_usage": 18.0,
        "memory_usage": 46.0,
        "disk_usage": 52.0,
        "gateway": "192.168.1.1",
        "dns_server": "192.168.1.1",
        "network_status": "CONNECTED",
    },
    {
        "endpoint_id": "SRV-DC01",
        "cpu_usage": 37.0,
        "memory_usage": 64.0,
        "disk_usage": 48.0,
        "gateway": "192.168.1.1",
        "dns_server": "192.168.1.10",
        "network_status": "CONNECTED",
    },
]


db = SessionLocal()

try:
    for item in telemetry_data:
        existing = (
            db.query(EndpointTelemetry)
            .filter(
                EndpointTelemetry.endpoint_id
                == item["endpoint_id"]
            )
            .first()
        )

        if existing:
            existing.cpu_usage = item["cpu_usage"]
            existing.memory_usage = item["memory_usage"]
            existing.disk_usage = item["disk_usage"]
            existing.gateway = item["gateway"]
            existing.dns_server = item["dns_server"]
            existing.network_status = item["network_status"]
            existing.collected_at = datetime.utcnow()
        else:
            telemetry = EndpointTelemetry(**item)
            db.add(telemetry)

    db.commit()

    print("Endpoint telemetry seeded successfully.")

finally:
    db.close()