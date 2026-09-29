from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SecurityEventBase(BaseModel):
    event_id: str
    title: str
    description: str
    severity: str
    status: str
    category: str
    asset: str
    source: str
    confidence: int
    alert_id: Optional[str] = None
    incident_id: Optional[str] = None


class SecurityEventResponse(SecurityEventBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )