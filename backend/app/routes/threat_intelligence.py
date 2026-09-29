from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


class ThreatCorrelation(BaseModel):
    type: str
    value: str
    context: str
    time: datetime
    severity: str


class ThreatIntelligenceResponse(BaseModel):
    indicator_id: str
    correlation_source: str
    correlations: list[ThreatCorrelation]


router = APIRouter(
    prefix="/api/threat-intelligence",
    tags=["Threat Intelligence"],
)


# These relationships are kept in the backend so the IOC investigation page
# does not depend on hard-coded correlation links in React.
# They reference the existing CyberSentinel event/alert/incident objects.
IOC_CORRELATIONS: dict[str, list[dict[str, Any]]] = {
    "IOC-001": [
        {
            "type": "EVENT",
            "value": "EVT-1048",
            "context": "Malicious outbound connection detected",
            "time": "2026-09-27T22:41:08",
            "severity": "CRITICAL",
        },
        {
            "type": "ALERT",
            "value": "ALT-018",
            "context": "Malicious outbound connection detected",
            "time": "2026-09-27T22:41:08",
            "severity": "CRITICAL",
        },
        {
            "type": "INCIDENT",
            "value": "INC-003",
            "context": "Suspicious outbound PowerShell activity",
            "time": "2026-09-27T22:41:08",
            "severity": "CRITICAL",
        },
        {
            "type": "ENDPOINT",
            "value": "WIN-01",
            "context": "Endpoint associated with the correlated network activity",
            "time": "2026-09-27T22:41:08",
            "severity": "CRITICAL",
        },
    ],
    "IOC-002": [
        {
            "type": "EVENT",
            "value": "EVT-1048",
            "context": "Malicious outbound connection detected",
            "time": "2026-09-27T22:41:08",
            "severity": "CRITICAL",
        },
        {
            "type": "ALERT",
            "value": "ALT-018",
            "context": "Malicious outbound connection detected",
            "time": "2026-09-27T22:41:08",
            "severity": "CRITICAL",
        },
        {
            "type": "INCIDENT",
            "value": "INC-003",
            "context": "Suspicious outbound PowerShell activity",
            "time": "2026-09-27T22:41:08",
            "severity": "CRITICAL",
        },
        {
            "type": "ENDPOINT",
            "value": "WIN-01",
            "context": "Endpoint associated with the correlated network activity",
            "time": "2026-09-27T22:41:08",
            "severity": "CRITICAL",
        },
    ],
    "IOC-003": [
        {
            "type": "EVENT",
            "value": "EVT-1045",
            "context": "Unsigned executable execution",
            "time": "2026-09-27T08:14:38",
            "severity": "HIGH",
        },
        {
            "type": "ALERT",
            "value": "ALT-031",
            "context": "Unsigned executable execution",
            "time": "2026-09-27T08:14:38",
            "severity": "HIGH",
        },
        {
            "type": "INCIDENT",
            "value": "INC-006",
            "context": "Unsigned executable execution",
            "time": "2026-09-27T08:14:38",
            "severity": "HIGH",
        },
        {
            "type": "ENDPOINT",
            "value": "WIN-04",
            "context": "Endpoint associated with the executable activity",
            "time": "2026-09-27T08:14:38",
            "severity": "HIGH",
        },
    ],
    "IOC-004": [
        {
            "type": "EVENT",
            "value": "EVT-1048",
            "context": "Malicious outbound connection detected",
            "time": "2026-09-27T22:41:08",
            "severity": "CRITICAL",
        },
        {
            "type": "ALERT",
            "value": "ALT-018",
            "context": "Malicious outbound connection detected",
            "time": "2026-09-27T22:41:08",
            "severity": "CRITICAL",
        },
        {
            "type": "INCIDENT",
            "value": "INC-003",
            "context": "Suspicious outbound PowerShell activity",
            "time": "2026-09-27T22:41:08",
            "severity": "CRITICAL",
        },
        {
            "type": "ENDPOINT",
            "value": "WIN-01",
            "context": "Endpoint associated with the correlated network activity",
            "time": "2026-09-27T22:41:08",
            "severity": "CRITICAL",
        },
    ],
    "IOC-005": [
        {
            "type": "EVENT",
            "value": "EVT-1046",
            "context": "Repeated RDP authentication failures",
            "time": "2026-09-27T22:41:08",
            "severity": "MEDIUM",
        },
        {
            "type": "ALERT",
            "value": "ALT-007",
            "context": "Repeated RDP authentication failures",
            "time": "2026-09-27T22:41:08",
            "severity": "MEDIUM",
        },
        {
            "type": "INCIDENT",
            "value": "INC-002",
            "context": "Repeated RDP authentication failures",
            "time": "2026-09-27T22:41:08",
            "severity": "MEDIUM",
        },
        {
            "type": "ENDPOINT",
            "value": "WIN-02",
            "context": "Endpoint associated with the authentication activity",
            "time": "2026-09-27T22:41:08",
            "severity": "MEDIUM",
        },
    ],
    "IOC-006": [
        {
            "type": "EVENT",
            "value": "EVT-1047",
            "context": "PowerShell execution policy bypass",
            "time": "2026-09-27T22:41:08",
            "severity": "HIGH",
        },
        {
            "type": "ALERT",
            "value": "ALT-021",
            "context": "PowerShell execution policy bypass",
            "time": "2026-09-27T22:41:08",
            "severity": "HIGH",
        },
        {
            "type": "INCIDENT",
            "value": "INC-001",
            "context": "PowerShell execution policy bypass",
            "time": "2026-09-27T22:41:08",
            "severity": "HIGH",
        },
        {
            "type": "ENDPOINT",
            "value": "WIN-02",
            "context": "Endpoint associated with the PowerShell activity",
            "time": "2026-09-27T22:41:08",
            "severity": "HIGH",
        },
    ],
    "IOC-007": [
        {
            "type": "EVENT",
            "value": "EVT-1045",
            "context": "Unsigned executable execution",
            "time": "2026-09-27T08:14:38",
            "severity": "HIGH",
        },
        {
            "type": "ALERT",
            "value": "ALT-031",
            "context": "Unsigned executable execution",
            "time": "2026-09-27T08:14:38",
            "severity": "HIGH",
        },
        {
            "type": "INCIDENT",
            "value": "INC-006",
            "context": "Unsigned executable execution",
            "time": "2026-09-27T08:14:38",
            "severity": "HIGH",
        },
        {
            "type": "ENDPOINT",
            "value": "WIN-04",
            "context": "Endpoint associated with the executable activity",
            "time": "2026-09-27T08:14:38",
            "severity": "HIGH",
        },
    ],
    "IOC-008": [],
    "IOC-009": [
        {
            "type": "EVENT",
            "value": "EVT-1046",
            "context": "Repeated RDP authentication failures",
            "time": "2026-09-27T22:41:08",
            "severity": "MEDIUM",
        },
        {
            "type": "ALERT",
            "value": "ALT-007",
            "context": "Repeated RDP authentication failures",
            "time": "2026-09-27T22:41:08",
            "severity": "MEDIUM",
        },
        {
            "type": "INCIDENT",
            "value": "INC-002",
            "context": "Repeated RDP authentication failures",
            "time": "2026-09-27T22:41:08",
            "severity": "MEDIUM",
        },
        {
            "type": "ENDPOINT",
            "value": "WIN-02",
            "context": "Endpoint associated with the authentication activity",
            "time": "2026-09-27T22:41:08",
            "severity": "MEDIUM",
        },
    ],
    "IOC-010": [
        {
            "type": "EVENT",
            "value": "EVT-1043",
            "context": "Security file deletion attempt",
            "time": "2026-09-27T22:41:08",
            "severity": "HIGH",
        },
        {
            "type": "ALERT",
            "value": "ALT-034",
            "context": "Security file deletion attempt",
            "time": "2026-09-27T22:41:08",
            "severity": "HIGH",
        },
        {
            "type": "INCIDENT",
            "value": "INC-007",
            "context": "Security file deletion attempt",
            "time": "2026-09-27T22:41:08",
            "severity": "HIGH",
        },
        {
            "type": "ENDPOINT",
            "value": "WIN-02",
            "context": "Endpoint associated with the file activity",
            "time": "2026-09-27T22:41:08",
            "severity": "HIGH",
        },
    ],
}


@router.get("/{indicator_id}", response_model=ThreatIntelligenceResponse)
def read_threat_indicator(indicator_id: str):
    correlations = IOC_CORRELATIONS.get(indicator_id)

    if correlations is None:
        raise HTTPException(status_code=404, detail="Threat indicator not found")

    return {
        "indicator_id": indicator_id,
        "correlation_source": "CyberSentinel API",
        "correlations": correlations,
    }
