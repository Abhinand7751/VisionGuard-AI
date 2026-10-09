from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.dependencies import get_camera_service
from app.services.camera_service import CameraService
from app.services.tracking_worker import tracking_worker

router = APIRouter()


class TrackingStatusResponse(BaseModel):
    camera_id: int
    running: bool
    tracks: list[dict]


@router.post("/cameras/{camera_id}/start")
def start_camera_tracking(
    camera_id: int,
    camera_service: CameraService = Depends(get_camera_service),
):
    """Start continuous YOLO + ByteTrack processing for a camera."""

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

    if tracking_worker.is_running(camera.id):
        return {
            "camera_id": camera.id,
            "status": "already_running",
            "message": "Tracking is already running.",
        }

    tracking_worker.start(
        camera.id,
        camera.stream_url,
    )

    return {
        "camera_id": camera.id,
        "status": "started",
        "message": "Continuous tracking started.",
    }


@router.post("/cameras/{camera_id}/stop")
def stop_camera_tracking(
    camera_id: int,
    camera_service: CameraService = Depends(get_camera_service),
):
    """Stop continuous tracking for a camera."""

    camera = camera_service.get_camera(camera_id)

    if camera is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found.",
        )

    tracking_worker.stop(camera.id)

    return {
        "camera_id": camera.id,
        "status": "stopped",
        "message": "Continuous tracking stopped.",
    }


@router.get(
    "/cameras/{camera_id}/status",
    response_model=TrackingStatusResponse,
)
def get_camera_tracking_status(
    camera_id: int,
    camera_service: CameraService = Depends(get_camera_service),
) -> TrackingStatusResponse:
    """Return the current tracking state and latest tracks."""

    camera = camera_service.get_camera(camera_id)

    if camera is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found.",
        )

    return TrackingStatusResponse(
        camera_id=camera.id,
        running=tracking_worker.is_running(camera.id),
        tracks=tracking_worker.get_latest_tracks(camera.id),
    )
