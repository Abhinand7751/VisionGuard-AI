from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_camera_service
from app.services.camera_service import CameraService
from app.services.tracking_service import tracking_service
from app.schemas.tracking import TrackingTestResponse, TrackObject


router = APIRouter()


@router.get(
    "/cameras/{camera_id}/test",
    response_model=TrackingTestResponse,
)
def test_camera_tracking(
    camera_id: int,
    camera_service: CameraService = Depends(get_camera_service),
) -> TrackingTestResponse:
    """Process a short sequence from a camera using YOLO + ByteTrack."""
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

    try:
        results = tracking_service.track_camera(
            camera.id,
            camera.stream_url,
        )

        frames_processed = 0
        latest_tracks: list[dict] = []

        for result in results:
            latest_tracks = tracking_service.extract_tracks(result)
            frames_processed += 1

            if frames_processed >= 10:
                break

    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Tracking dependencies are not installed.",
        ) from exc

    return TrackingTestResponse(
        camera_id=camera.id,
        frames_processed=frames_processed,
        tracks=[
            TrackObject(**track)
            for track in latest_tracks
        ],
    )
