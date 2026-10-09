from pydantic import BaseModel, Field


class TrackObject(BaseModel):
    """A single tracked object returned by the tracking API."""

    track_id: int
    class_name: str
    confidence: float = Field(ge=0.0, le=1.0)
    bbox: list[float]


class TrackingTestResponse(BaseModel):
    """Response returned by the controlled ByteTrack test endpoint."""

    camera_id: int
    frames_processed: int
    tracks: list[TrackObject]
