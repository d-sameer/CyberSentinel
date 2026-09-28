from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EndpointTelemetryResponse(BaseModel):
    id: int
    endpoint_id: str
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    gateway: str
    dns_server: str
    network_status: str
    collected_at: datetime

    model_config = ConfigDict(from_attributes=True)