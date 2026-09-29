from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AlertResponse(BaseModel):
    id: int
    alert_id: str
    title: str
    description: str
    severity: str
    status: str
    category: str
    source: str
    asset: str
    rule_id: str
    confidence: int
    created_at: datetime
    event_id: Optional[str] = None
    incident_id: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True,
    )
