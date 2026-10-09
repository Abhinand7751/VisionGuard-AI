from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Response model for service health checks."""

    status: str
    service: str
    environment: str
    database: str
