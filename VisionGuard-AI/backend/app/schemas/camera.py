from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

SUPPORTED_STREAM_PREFIXES = ("rtsp://", "rtmp://", "http://", "https://", "file://")


class CameraBase(BaseModel):
    """Shared camera fields."""

    name: str = Field(min_length=1, max_length=120)
    stream_url: str = Field(min_length=1, max_length=500)
    location: str | None = Field(default=None, max_length=200)
    is_active: bool = True

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        """Trim and validate camera names."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("Camera name cannot be blank.")
        return normalized

    @field_validator("stream_url")
    @classmethod
    def validate_stream_url(cls, value: str) -> str:
        """Validate supported stream source formats."""
        normalized = value.strip()
        if normalized.isdigit():
            return normalized
        if normalized.lower().startswith(SUPPORTED_STREAM_PREFIXES):
            return normalized
        raise ValueError(
            "Stream URL must use rtsp, rtmp, http, https, file, or a numeric device index.",
        )

    @field_validator("location")
    @classmethod
    def normalize_location(cls, value: str | None) -> str | None:
        """Trim optional camera locations."""
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class CameraCreate(CameraBase):
    """Request model for creating a camera."""


class CameraUpdate(BaseModel):
    """Request model for partially updating a camera."""

    name: str | None = Field(default=None, min_length=1, max_length=120)
    stream_url: str | None = Field(default=None, min_length=1, max_length=500)
    location: str | None = Field(default=None, max_length=200)
    is_active: bool | None = None

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        """Trim and validate camera names when provided."""
        if value is None:
            return None
        normalized = value.strip()
        if not normalized:
            raise ValueError("Camera name cannot be blank.")
        return normalized

    @field_validator("stream_url")
    @classmethod
    def validate_stream_url(cls, value: str | None) -> str | None:
        """Validate supported stream source formats when provided."""
        if value is None:
            return None
        normalized = value.strip()
        if normalized.isdigit():
            return normalized
        if normalized.lower().startswith(SUPPORTED_STREAM_PREFIXES):
            return normalized
        raise ValueError(
            "Stream URL must use rtsp, rtmp, http, https, file, or a numeric device index.",
        )

    @field_validator("location")
    @classmethod
    def normalize_location(cls, value: str | None) -> str | None:
        """Trim optional camera locations when provided."""
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class CameraResponse(CameraBase):
    """Response model for camera resources."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
