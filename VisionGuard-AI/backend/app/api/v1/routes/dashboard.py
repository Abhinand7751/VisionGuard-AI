from fastapi import APIRouter, Depends

from app.api.dependencies import get_camera_service, get_event_service
from app.schemas.dashboard import DashboardSummary
from app.schemas.event import EventSeverity
from app.services.camera_service import CameraService
from app.services.event_service import SurveillanceEventService

router = APIRouter()

SEVERITY_RANK: dict[str, int] = {
    "info": 0,
    "low": 1,
    "medium": 2,
    "high": 3,
    "critical": 4,
}


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    camera_service: CameraService = Depends(get_camera_service),
    event_service: SurveillanceEventService = Depends(get_event_service),
) -> DashboardSummary:
    """Return aggregate dashboard metrics for the operations console."""
    events = event_service.list_events()
    highest_severity: EventSeverity | None = None
    if events:
        highest_severity = max(
            (event.severity for event in events),
            key=lambda severity: SEVERITY_RANK.get(severity, 0),
        )

    return DashboardSummary(
        total_cameras=camera_service.count_cameras(),
        active_cameras=camera_service.count_active_cameras(),
        total_events=event_service.count_events(),
        latest_events=event_service.count_recent_events(),
        critical_events=event_service.count_events_by_severity("critical"),
        high_events=event_service.count_events_by_severity("high"),
        detection_status="YOLO ready",
        highest_severity=highest_severity,
    )
