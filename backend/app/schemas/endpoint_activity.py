from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EndpointActivityResponse(BaseModel):
    id: int
    activity_id: str
    endpoint_id: str
    title: str
    description: str
    severity: str
    category: str
    status: str
    observed_at: datetime

    model_config = ConfigDict(from_attributes=True)