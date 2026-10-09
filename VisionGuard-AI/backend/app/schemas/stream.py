from pydantic import BaseModel


class StreamPlaceholderResponse(BaseModel):
    """Response model for the Phase 1 webcam placeholder."""

    status: str
    message: str


class StreamHealthResponse(BaseModel):
    """Response model for camera stream diagnostics."""

    camera_id: int
    status: str
    message: str


class SnapshotResponse(BaseModel):
    """Response model for captured camera snapshots."""

    camera_id: int
    event_id: int
    snapshot_url: str
    message: str
