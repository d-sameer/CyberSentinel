from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.network_connection import NetworkConnection


# ============================================================
# RESPONSE MODEL
# ============================================================

class NetworkConnectionResponse(BaseModel):
    id: str
    source: str
    destination: str
    protocol: str
    port: int
    status: str
    bytes: str
    endpoint: str
    direction: str
    threatLevel: str
    operatingSystem: str
    process: str
    parentProcess: str
    connectionCount: int
    firstObserved: str
    lastObserved: str


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/network",
    tags=["Network Security"],
)


# ============================================================
# STATIC NETWORK DETAILS
# ============================================================

NETWORK_DETAILS = {
    "CONN-001": {
        "operatingSystem": "Windows 11",
        "process": "chrome.exe",
        "parentProcess": "explorer.exe",
        "connectionCount": 42,
        "firstObserved": "10:12:04",
        "lastObserved": "10:58:41",
    },
    "CONN-002": {
        "operatingSystem": "Kali Linux",
        "process": "curl",
        "parentProcess": "bash",
        "connectionCount": 17,
        "firstObserved": "10:31:22",
        "lastObserved": "11:02:17",
    },
    "CONN-003": {
        "operatingSystem": "Ubuntu Linux",
        "process": "systemd-resolved",
        "parentProcess": "systemd",
        "connectionCount": 86,
        "firstObserved": "10:05:10",
        "lastObserved": "11:03:02",
    },
    "CONN-004": {
        "operatingSystem": "Windows 10",
        "process": "svchost.exe",
        "parentProcess": "services.exe",
        "connectionCount": 3,
        "firstObserved": "10:44:31",
        "lastObserved": "10:44:49",
    },
    "CONN-005": {
        "operatingSystem": "Windows 11",
        "process": "Code.exe",
        "parentProcess": "explorer.exe",
        "connectionCount": 29,
        "firstObserved": "10:21:09",
        "lastObserved": "11:01:54",
    },
}


# ============================================================
# DATABASE SEED DATA
# ============================================================

SEED_CONNECTIONS = [
    {
        "connection_id": "CONN-001",
        "source_ip": "192.168.1.101",
        "destination_ip": "142.250.183.14",
        "protocol": "HTTPS",
        "port": 443,
        "status": "ESTABLISHED",
        "traffic": "18.4 MB",
        "endpoint": "WIN-01",
        "direction": "EGRESS",
        "threat_level": "LOW",
    },
    {
        "connection_id": "CONN-002",
        "source_ip": "192.168.1.102",
        "destination_ip": "203.0.113.45",
        "protocol": "HTTPS",
        "port": 443,
        "status": "SUSPICIOUS",
        "traffic": "4.7 MB",
        "endpoint": "KALI-01",
        "direction": "EGRESS",
        "threat_level": "HIGH",
    },
    {
        "connection_id": "CONN-003",
        "source_ip": "192.168.1.104",
        "destination_ip": "192.168.1.1",
        "protocol": "DNS",
        "port": 53,
        "status": "ESTABLISHED",
        "traffic": "824 KB",
        "endpoint": "LINUX-01",
        "direction": "INGRESS",
        "threat_level": "LOW",
    },
    {
        "connection_id": "CONN-004",
        "source_ip": "192.168.1.103",
        "destination_ip": "10.0.0.12",
        "protocol": "SMB",
        "port": 445,
        "status": "BLOCKED",
        "traffic": "1.2 MB",
        "endpoint": "WIN-02",
        "direction": "EGRESS",
        "threat_level": "CRITICAL",
    },
    {
        "connection_id": "CONN-005",
        "source_ip": "192.168.1.105",
        "destination_ip": "52.96.148.10",
        "protocol": "HTTPS",
        "port": 443,
        "status": "ESTABLISHED",
        "traffic": "9.6 MB",
        "endpoint": "DEV-01",
        "direction": "EGRESS",
        "threat_level": "LOW",
    },
]


# ============================================================
# SEED DATABASE
# ============================================================

def seed_connections(db: Session) -> None:
    existing = db.scalars(
        select(NetworkConnection)
    ).all()

    existing_ids = {
        connection.connection_id
        for connection in existing
    }

    added = False

    for item in SEED_CONNECTIONS:
        if item["connection_id"] in existing_ids:
            continue

        db.add(
            NetworkConnection(**item)
        )

        added = True

    if added:
        db.commit()


# ============================================================
# RESPONSE CONVERTER
# ============================================================

def connection_to_dict(
    connection: NetworkConnection,
):
    details = NETWORK_DETAILS.get(
        connection.connection_id,
        {
            "operatingSystem": "Unknown",
            "process": "Unknown",
            "parentProcess": "Unknown",
            "connectionCount": 0,
            "firstObserved": "Unknown",
            "lastObserved": "Unknown",
        },
    )

    return {
        "id": connection.connection_id,
        "source": connection.source_ip,
        "destination": connection.destination_ip,
        "protocol": connection.protocol,
        "port": connection.port,
        "status": connection.status,
        "bytes": connection.traffic,
        "endpoint": connection.endpoint,
        "direction": connection.direction,
        "threatLevel": connection.threat_level,

        "operatingSystem": details["operatingSystem"],
        "process": details["process"],
        "parentProcess": details["parentProcess"],
        "connectionCount": details["connectionCount"],
        "firstObserved": details["firstObserved"],
        "lastObserved": details["lastObserved"],
    }


# ============================================================
# GET ALL NETWORK CONNECTIONS
# ============================================================

@router.get("")
def get_network_connections(
    db: Session = Depends(get_db),
):
    connections = db.scalars(
        select(NetworkConnection).order_by(
            NetworkConnection.id.asc()
        )
    ).all()

    return [
        connection_to_dict(connection)
        for connection in connections
    ]


# ============================================================
# NETWORK SUMMARY
# ============================================================

@router.get("/summary")
def get_network_summary(
    db: Session = Depends(get_db),
):
    connections = db.scalars(
        select(NetworkConnection)
    ).all()

    active_connections = sum(
        1
        for connection in connections
        if connection.status == "ESTABLISHED"
    )

    suspicious_connections = sum(
        1
        for connection in connections
        if connection.status == "SUSPICIOUS"
    )

    blocked_connections = sum(
        1
        for connection in connections
        if connection.status == "BLOCKED"
    )

    ingress_mb = 0.0
    egress_mb = 0.0

    for connection in connections:
        traffic = connection.traffic.upper()

        if "KB" in traffic:
            value = (
                float(
                    traffic
                    .replace("KB", "")
                    .strip()
                )
                / 1024
            )
        else:
            value = float(
                traffic
                .replace("MB", "")
                .strip()
            )

        if connection.direction == "INGRESS":
            ingress_mb += value
        else:
            egress_mb += value

    protocol_counts = {}

    for connection in connections:
        protocol_counts[
            connection.protocol
        ] = protocol_counts.get(
            connection.protocol,
            0
        ) + 1

    total = max(len(connections), 1)

    protocols = []

    for protocol, count in sorted(
        protocol_counts.items(),
        key=lambda item: item[1],
        reverse=True,
    ):
        port = next(
            (
                connection.port
                for connection in connections
                if connection.protocol == protocol
            ),
            0,
        )

        protocols.append(
            {
                "protocol": protocol,
                "port": port,
                "percentage": round(
                    (count / total) * 100
                ),
            }
        )

    return {
        "totalConnections": len(connections),
        "activeConnections": active_connections,
        "suspiciousConnections": suspicious_connections,
        "blockedConnections": blocked_connections,
        "securityEvents": (
            suspicious_connections
            + blocked_connections
        ),
        "ingressTraffic": (
            f"{ingress_mb:.1f} MB"
        ),
        "egressTraffic": (
            f"{egress_mb:.1f} MB"
        ),
        "protocols": protocols,
    }


# ============================================================
# GET SINGLE CONNECTION
# ============================================================

@router.get(
    "/{connection_id}",
    response_model=NetworkConnectionResponse,
)
def get_network_connection(
    connection_id: str,
    db: Session = Depends(get_db),
):
    connection = db.scalar(
        select(NetworkConnection).where(
            NetworkConnection.connection_id
            == connection_id
        )
    )

    if connection is None:
        raise HTTPException(
            status_code=404,
            detail="Network connection not found",
        )

    return connection_to_dict(connection)