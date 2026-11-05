"""Evidence-based analysis of Windows network connection observations."""

from ipaddress import ip_address
from typing import Any


def _is_public_ip(value: str | None) -> bool:
    if not value:
        return False

    try:
        return ip_address(value).is_global
    except ValueError:
        return False


def analyze_network_connection(connection: dict[str, Any]) -> dict[str, Any]:
    """Return explainable findings without blocking or modifying connections."""

    findings: list[dict[str, str]] = []
    score = 0

    remote = connection.get("remote") or {}
    local = connection.get("local") or {}

    remote_ip = remote.get("ip")
    local_port = local.get("port")
    status = str(connection.get("status") or "").upper()
    process = connection.get("process")

    if remote_ip and _is_public_ip(str(remote_ip)):
        findings.append({
            "rule": "PUBLIC_REMOTE",
            "severity": "INFO",
            "reason": "Connection has a public remote IP address. This is common and is not evidence of malicious activity by itself.",
        })

    if status == "LISTEN" and local_port in {21, 23, 445, 3389, 5900}:
        score += 20
        findings.append({
            "rule": "SENSITIVE_LISTENING_PORT",
            "severity": "MEDIUM",
            "reason": f"A service is listening on port {local_port}. Verify that this service is expected and appropriately protected.",
        })

    if not process:
        score += 5
        findings.append({
            "rule": "PROCESS_UNAVAILABLE",
            "severity": "LOW",
            "reason": "Process information is unavailable. This may be caused by permissions or a process ending during collection.",
        })

    if not findings:
        findings.append({
            "rule": "NO_MATCHING_RULES",
            "severity": "INFO",
            "reason": "No configured detection rule matched this observation.",
        })

    risk_level = (
        "HIGH" if score >= 50
        else "MEDIUM" if score >= 20
        else "LOW" if score > 0
        else "INFO"
    )

    return {
        "risk_score": min(score, 100),
        "risk_level": risk_level,
        "findings": findings,
        "review_required": score > 0,
    }


def analyze_network_connections(
    connections: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Analyse a collection of observations while preserving source data."""

    results = []

    for connection in connections:
        results.append({
            **connection,
            "security_analysis": analyze_network_connection(connection),
        })

    return results