from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EndpointResponse(BaseModel):
    id: int
    endpoint_id: str
    hostname: str
    ip_address: str
    operating_system: str
    status: str
    risk_level: str
    agent_status: str
    last_seen: datetime
    open_alerts: int
    open_incidents: int
    description: str

    model_config = ConfigDict(
        from_attributes=True,
    )