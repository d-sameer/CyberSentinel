from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

class IdentityCorrelation(BaseModel):
    type: str
    value: str
    context: str

class IdentityCorrelationResponse(BaseModel):
    identity_id: str
    correlation_source: str
    correlations: list[IdentityCorrelation]

router = APIRouter(prefix="/api/identity", tags=["Identity Correlation"])

IDENTITY_CORRELATIONS: dict[str, list[dict[str, Any]]] = {
    "IAM-001": [{"type": "ENDPOINT", "value": "WIN-01", "context": "Endpoint associated with the successful interactive login"}],
    "IAM-002": [
        {"type": "EVENT", "value": "EVT-1046", "context": "Repeated RDP authentication failures"},
        {"type": "ALERT", "value": "ALT-007", "context": "Identity alert associated with repeated authentication failures"},
        {"type": "INCIDENT", "value": "INC-002", "context": "Repeated RDP authentication failures"},
        {"type": "ENDPOINT", "value": "WIN-02", "context": "Endpoint associated with the authentication activity"},
    ],
    "IAM-003": [{"type": "ENDPOINT", "value": "WIN-03", "context": "Endpoint associated with the service account login"}],
    "IAM-004": [
        {"type": "INCIDENT", "value": "INC-003", "context": "Existing incident associated with the blocked external authentication activity"},
        {"type": "ENDPOINT", "value": "WIN-01", "context": "Endpoint associated with the blocked authentication activity"},
    ],
    "IAM-005": [
        {"type": "INCIDENT", "value": "INC-006", "context": "Existing incident associated with administrative security activity"},
        {"type": "ENDPOINT", "value": "WIN-02", "context": "Endpoint recorded by the identity event"},
    ],
}

@router.get("/{identity_id}", response_model=IdentityCorrelationResponse)
def read_identity_correlations(identity_id: str):
    correlations = IDENTITY_CORRELATIONS.get(identity_id)
    if correlations is None:
        raise HTTPException(status_code=404, detail="Identity event not found")
    return {
        "identity_id": identity_id,
        "correlation_source": "CyberSentinel API",
        "correlations": correlations,
    }
