from typing import Any

from ultralytics import YOLO


class ByteTrackTracker:
    """Persistent YOLO + ByteTrack tracker for video streams."""

    def __init__(self, model_path: str, confidence: float = 0.25) -> None:
        self.model = YOLO(model_path)
        self.confidence = confidence

    def track_stream(self, stream_url: str):
        """Track objects continuously on a video stream."""
        return self.model.track(
            source=stream_url,
            tracker="bytetrack.yaml",
            persist=True,
            stream=True,
            conf=self.confidence,
            verbose=False,
        )

    @staticmethod
    def extract_tracks(result: Any) -> list[dict[str, Any]]:
        """Extract tracked objects from one YOLO result."""
        tracks: list[dict[str, Any]] = []

        if result.boxes is None or result.boxes.id is None:
            return tracks

        names = result.names
        boxes = result.boxes

        for box, track_id in zip(boxes, boxes.id):
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            coordinates = [
                float(value)
                for value in box.xyxy[0].tolist()
            ]

            tracks.append(
                {
                    "track_id": int(track_id.item()),
                    "class_name": str(names[class_id]),
                    "confidence": round(confidence, 4),
                    "bbox": [round(value, 2) for value in coordinates],
                }
            )

        return tracks
