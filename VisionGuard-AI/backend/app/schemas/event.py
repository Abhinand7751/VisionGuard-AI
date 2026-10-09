from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

EventSeverity = Literal["info", "low", "medium", "high", "critical"]


class SurveillanceEventBase(BaseModel):
    """Shared surveillance event fields."""

    camera_id: int
    event_type: str = Field(min_length=1, max_length=80)
    severity: EventSeverity = "info"
    description: str | None = None
    snapshot_url: str | None = Field(default=None, max_length=500)

    @field_validator("event_type")
    @classmethod
    def normalize_event_type(cls, value: str) -> str:
        """Trim and validate event type labels."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("Event type cannot be blank.")
        return normalized

    @field_validator("description")
    @classmethod
    def normalize_description(cls, value: str | None) -> str | None:
        """Trim optional event descriptions."""
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None

    @field_validator("snapshot_url")
    @classmethod
    def normalize_snapshot_url(cls, value: str | None) -> str | None:
        """Trim optional snapshot URLs."""
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class SurveillanceEventCreate(SurveillanceEventBase):
    """Request model for creating a surveillance event."""


class SurveillanceEventResponse(SurveillanceEventBase):
    """Response model for surveillance event resources."""

    id: int
    detected_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
