from typing import Any

from app.core.config import settings
from app.tracking.bytetrack_tracker import ByteTrackTracker


class TrackingService:
    """Service for continuous object tracking on camera streams."""

    def __init__(self) -> None:
        self._trackers: dict[int, ByteTrackTracker] = {}

    def get_tracker(self, camera_id: int) -> ByteTrackTracker:
        """Return the persistent tracker assigned to a camera."""
        if camera_id not in self._trackers:
            self._trackers[camera_id] = ByteTrackTracker(
                model_path=settings.yolo_model_path,
                confidence=settings.yolo_confidence_threshold,
            )

        return self._trackers[camera_id]

    def track_camera(self, camera_id: int, stream_url: str):
        """Start continuous ByteTrack tracking for a camera."""
        tracker = self.get_tracker(camera_id)
        return tracker.track_stream(stream_url)

    @staticmethod
    def extract_tracks(result: Any) -> list[dict[str, Any]]:
        """Convert one YOLO tracking result into API-friendly data."""
        return ByteTrackTracker.extract_tracks(result)


tracking_service = TrackingService()
