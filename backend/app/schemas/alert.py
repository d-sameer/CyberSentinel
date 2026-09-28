from datetime import datetime

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

    model_config = ConfigDict(
        from_attributes=True,
    )