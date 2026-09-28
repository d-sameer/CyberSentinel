from datetime import datetime

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


class SecurityEventResponse(SecurityEventBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )