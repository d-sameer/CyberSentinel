
"""Collect live Windows network connection observations using psutil.

This module is read-only: it does not change firewall rules, terminate
connections, or write to the CyberSentinel database.
"""

import socket
from datetime import datetime, timezone
from typing import Any

import psutil


def _address_to_dict(address: Any) -> dict[str, Any] | None:
    """Convert a psutil address tuple into a JSON-friendly dictionary."""
    if not address:
        return None

    return {
        "ip": address.ip,
        "port": address.port,
    }


def collect_windows_connections(
    limit: int = 500,
) -> dict[str, Any]:
    """Return current Windows TCP/UDP connection-table observations."""
    if limit < 1 or limit > 5000:
        raise ValueError("limit must be between 1 and 5000")

    observations: list[dict[str, Any]] = []
    permission_limited = False

    try:
        connections = psutil.net_connections(kind="inet")
    except psutil.AccessDenied:
        connections = []
        permission_limited = True

    for connection in connections[:limit]:
        process_name = None

        if connection.pid is not None:
            try:
                process_name = psutil.Process(
                    connection.pid
                ).name()
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass

        protocol = (
            "TCP"
            if connection.type == socket.SOCK_STREAM
            else "UDP"
            if connection.type == socket.SOCK_DGRAM
            else "UNKNOWN"
        )

        observations.append(
            {
                "source": "windows_psutil",
                "observed_at": datetime.now(timezone.utc).isoformat(),
                "protocol": protocol,
                "local": _address_to_dict(connection.laddr),
                "remote": _address_to_dict(connection.raddr),
                "status": connection.status,
                "pid": connection.pid,
                "process": process_name,
            }
        )

    return {
        "source": "windows_psutil",
        "observed_at": datetime.now(timezone.utc).isoformat(),
        "total_observed": len(observations),
        "limit": limit,
        "permission_limited": permission_limited,
        "connections": observations,
    }
