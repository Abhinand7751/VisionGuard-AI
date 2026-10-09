from pathlib import Path
from typing import Any

import cv2
import numpy as np

from app.core.config import settings
from app.schemas.detection import DetectionObject


class YoloDetector:
    """Lazy-loaded YOLO detector for still-frame inference."""

    def __init__(self) -> None:
        """Initialize detector without loading model weights immediately."""
        self._model: Any | None = None

    def detect_image(self, image_path: Path) -> tuple[list[DetectionObject], np.ndarray]:
        """Run YOLO detection on an image path and return detections plus annotation."""
        model = self._get_model()
        results = model.predict(
            source=str(image_path),
            conf=settings.yolo_confidence_threshold,
            verbose=False,
        )
        result = results[0]
        names = result.names

        detections: list[DetectionObject] = []
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            coordinates = [float(value) for value in box.xyxy[0].tolist()]
            detections.append(
                DetectionObject(
                    class_name=str(names[class_id]),
                    confidence=round(confidence, 4),
                    bbox=[round(value, 2) for value in coordinates],
                ),
            )

        annotated_frame = result.plot()
        return detections, annotated_frame

    def save_annotated_image(
        self,
        camera_id: int,
        annotated_frame: np.ndarray,
        source_filename: str,
    ) -> str:
        """Save an annotated detection image and return its public URL."""
        storage_dir = Path(settings.detection_storage_dir)
        storage_dir.mkdir(parents=True, exist_ok=True)

        annotated_filename = f"detected_{camera_id}_{source_filename}"
        annotated_path = storage_dir / annotated_filename
        saved = cv2.imwrite(str(annotated_path), annotated_frame)
        if not saved:
            raise RuntimeError("Annotated detection image could not be written.")

        return f"{settings.detection_public_path.rstrip('/')}/{annotated_filename}"

    def _get_model(self) -> Any:
        """Load and cache the YOLO model."""
        if self._model is None:
            from ultralytics import YOLO

            self._model = YOLO(settings.yolo_model_path)
        return self._model


yolo_detector = YoloDetector()
