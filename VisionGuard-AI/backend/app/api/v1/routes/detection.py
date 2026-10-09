from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_camera_service, get_event_service
from app.detection.yolo_detector import yolo_detector
from app.schemas.detection import DetectionResponse
from app.schemas.event import SurveillanceEventCreate
from app.services.camera_service import CameraService
from app.services.event_service import SurveillanceEventService
from app.services.video_stream_service import VideoStreamService

router = APIRouter()

CRITICAL_DETECTION_CLASSES = {
    "knife",
    "gun",
    "fire",
    "smoke",
}
HIGH_DETECTION_CLASSES = {
    "person",
    "car",
    "truck",
    "bus",
    "motorcycle",
}
LOW_DETECTION_CLASSES = {
    "bird",
    "cat",
    "dog",
    "horse",
    "sheep",
    "cow",
    "elephant",
    "bear",
    "zebra",
    "giraffe",
}


@router.post(
    "/cameras/{camera_id}/yolo",
    response_model=DetectionResponse,
)
def run_yolo_detection(
    camera_id: int,
    camera_service: CameraService = Depends(get_camera_service),
    event_service: SurveillanceEventService = Depends(get_event_service),
) -> DetectionResponse:
    """Run YOLO detection on one captured frame from a registered camera."""
    camera = camera_service.get_camera(camera_id)
    if camera is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found.",
        )
    if not camera.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Camera is inactive.",
        )

    stream_service = VideoStreamService()
    try:
        snapshot_path, snapshot_url = stream_service.capture_snapshot(
            camera.id,
            camera.stream_url,
        )
        detections, annotated_frame = yolo_detector.detect_image(snapshot_path)
        annotated_url = yolo_detector.save_annotated_image(
            camera.id,
            annotated_frame,
            Path(snapshot_path).name,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="YOLO dependencies are not installed. Rebuild the backend image.",
        ) from exc

    event_id: int | None = None
    if detections:
        severity = classify_detection_severity(
            [detection.class_name for detection in detections],
        )
        detected_labels = ", ".join(
            sorted({detection.class_name for detection in detections}),
        )
        event = event_service.create_event(
            SurveillanceEventCreate(
                camera_id=camera.id,
                event_type="yolo_detection",
                severity=severity,
                description=(
                    f"YOLO detected {len(detections)} object(s) on {camera.name}: "
                    f"{detected_labels}."
                ),
                snapshot_url=annotated_url,
            ),
        )
        event_id = event.id

    return DetectionResponse(
        camera_id=camera.id,
        event_id=event_id,
        detections=detections,
        snapshot_url=snapshot_url,
        annotated_snapshot_url=annotated_url,
        message=(
            f"Detected {len(detections)} object(s)."
            if detections
            else "No objects detected above confidence threshold."
        ),
    )


def classify_detection_severity(class_names: list[str]) -> str:
    """Return an event severity based on detected object classes."""
    normalized_names = {name.lower() for name in class_names}
    if normalized_names & CRITICAL_DETECTION_CLASSES:
        return "critical"
    if normalized_names & HIGH_DETECTION_CLASSES:
        return "high"
    if normalized_names and normalized_names <= LOW_DETECTION_CLASSES:
        return "low"
    return "medium"
