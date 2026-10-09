from pydantic import BaseModel

from app.schemas.event import EventSeverity


class DashboardSummary(BaseModel):
    """Aggregated metrics for the monitoring dashboard."""

    total_cameras: int
    active_cameras: int
    total_events: int
    latest_events: int
    critical_events: int
    high_events: int
    detection_status: str
    highest_severity: EventSeverity | None
