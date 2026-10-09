from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.api.dependencies import (
    get_camera_service,
    get_current_user,
    get_current_user_from_header_or_query,
    get_event_service,
)
from app.models.user import User
from app.schemas.event import SurveillanceEventCreate
from app.schemas.stream import (
    SnapshotResponse,
    StreamHealthResponse,
    StreamPlaceholderResponse,
)
from app.services.camera_service import CameraService
from app.services.event_service import SurveillanceEventService
from app.services.video_stream_service import VideoStreamService

router = APIRouter()


@router.get("/webcam", response_model=StreamPlaceholderResponse)
def webcam_stream_placeholder() -> StreamPlaceholderResponse:
    """Return placeholder metadata for the future webcam stream."""
    return StreamPlaceholderResponse(
        status="placeholder",
        message="Use /api/v1/stream/cameras/{camera_id}/mjpeg for MJPEG streaming.",
    )


@router.get("/cameras/{camera_id}/mjpeg")
def stream_camera_mjpeg(
    camera_id: int,
    camera_service: CameraService = Depends(get_camera_service),
    _current_user: User = Depends(get_current_user_from_header_or_query),
) -> StreamingResponse:
    """Stream a registered camera source as MJPEG frames."""
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
    capture = stream_service.open_capture(camera.stream_url)
    if not capture.isOpened():
        capture.release()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to open camera source.",
        )

    return StreamingResponse(
        stream_service.iter_mjpeg_frames(capture),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@router.get(
    "/cameras/{camera_id}/health",
    response_model=StreamHealthResponse,
)
def check_camera_stream_health(
    camera_id: int,
    camera_service: CameraService = Depends(get_camera_service),
    _current_user: User = Depends(get_current_user),
) -> StreamHealthResponse:
    """Check whether a registered camera source can return frames."""
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
    is_ready, message = stream_service.check_source(camera.stream_url)
    return StreamHealthResponse(
        camera_id=camera.id,
        status="ready" if is_ready else "unavailable",
        message=message,
    )


@router.post(
    "/cameras/{camera_id}/snapshot",
    response_model=SnapshotResponse,
    status_code=status.HTTP_201_CREATED,
)
def capture_camera_snapshot(
    camera_id: int,
    camera_service: CameraService = Depends(get_camera_service),
    event_service: SurveillanceEventService = Depends(get_event_service),
    _current_user: User = Depends(get_current_user),
) -> SnapshotResponse:
    """Capture a snapshot and record it as a surveillance event."""
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
        _, snapshot_url = stream_service.capture_snapshot(camera.id, camera.stream_url)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    event = event_service.create_event(
        SurveillanceEventCreate(
            camera_id=camera.id,
            event_type="snapshot_capture",
            severity="info",
            description=f"Snapshot captured from {camera.name}.",
            snapshot_url=snapshot_url,
        ),
    )
    return SnapshotResponse(
        camera_id=camera.id,
        event_id=event.id,
        snapshot_url=snapshot_url,
        message="Snapshot captured.",
    )
