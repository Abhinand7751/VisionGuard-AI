from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_camera_service
from app.models.camera import Camera
from app.schemas.camera import CameraCreate, CameraResponse, CameraUpdate
from app.services.camera_service import CameraService

router = APIRouter()


@router.get("", response_model=list[CameraResponse])
def list_cameras(
    service: CameraService = Depends(get_camera_service),
) -> list[Camera]:
    """List registered cameras."""
    return service.list_cameras()


@router.post(
    "",
    response_model=CameraResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_camera(
    payload: CameraCreate,
    service: CameraService = Depends(get_camera_service),
) -> Camera:
    """Create a registered camera source."""
    return service.create_camera(payload)


@router.get("/{camera_id}", response_model=CameraResponse)
def get_camera(
    camera_id: int,
    service: CameraService = Depends(get_camera_service),
) -> Camera:
    """Get a camera by id."""
    camera = service.get_camera(camera_id)
    if camera is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found.",
        )
    return camera


@router.patch("/{camera_id}", response_model=CameraResponse)
def update_camera(
    camera_id: int,
    payload: CameraUpdate,
    service: CameraService = Depends(get_camera_service),
) -> Camera:
    """Update a camera by id."""
    camera = service.get_camera(camera_id)
    if camera is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found.",
        )
    return service.update_camera(camera, payload)


@router.delete("/{camera_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_camera(
    camera_id: int,
    service: CameraService = Depends(get_camera_service),
) -> None:
    """Delete a camera by id."""
    camera = service.get_camera(camera_id)
    if camera is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found.",
        )
    service.delete_camera(camera)
