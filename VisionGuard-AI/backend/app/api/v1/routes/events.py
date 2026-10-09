from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_camera_service, get_event_service
from app.models.event import SurveillanceEvent
from app.schemas.event import SurveillanceEventCreate, SurveillanceEventResponse
from app.services.camera_service import CameraService
from app.services.event_service import SurveillanceEventService

router = APIRouter()


@router.get("", response_model=list[SurveillanceEventResponse])
def list_events(
    camera_id: int | None = Query(default=None),
    service: SurveillanceEventService = Depends(get_event_service),
) -> list[SurveillanceEvent]:
    """List surveillance events, optionally filtered by camera."""
    return service.list_events(camera_id=camera_id)


@router.post(
    "",
    response_model=SurveillanceEventResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_event(
    payload: SurveillanceEventCreate,
    camera_service: CameraService = Depends(get_camera_service),
    event_service: SurveillanceEventService = Depends(get_event_service),
) -> SurveillanceEvent:
    """Create a surveillance event for an existing camera."""
    if camera_service.get_camera(payload.camera_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found.",
        )
    return event_service.create_event(payload)


@router.get("/{event_id}", response_model=SurveillanceEventResponse)
def get_event(
    event_id: int,
    service: SurveillanceEventService = Depends(get_event_service),
) -> SurveillanceEvent:
    """Get a surveillance event by id."""
    event = service.get_event(event_id)
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found.",
        )
    return event
