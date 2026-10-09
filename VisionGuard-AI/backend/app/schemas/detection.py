from pydantic import BaseModel


class DetectionObject(BaseModel):
    """Detected object returned by the YOLO inference service."""

    class_name: str
    confidence: float
    bbox: list[float]


class DetectionResponse(BaseModel):
    """Response model for manual YOLO detection runs."""

    camera_id: int
    event_id: int | None
    detections: list[DetectionObject]
    snapshot_url: str
    annotated_snapshot_url: str | None
    message: str
