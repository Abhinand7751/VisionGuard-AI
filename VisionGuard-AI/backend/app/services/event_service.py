from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.event import SurveillanceEvent
from app.schemas.event import SurveillanceEventCreate


class SurveillanceEventService:
    """Application service for surveillance event operations."""

    def __init__(self, db: Session) -> None:
        """Initialize the service with a database session."""
        self.db = db

    def list_events(self, camera_id: int | None = None) -> list[SurveillanceEvent]:
        """Return events ordered by newest first."""
        statement = select(SurveillanceEvent).order_by(
            SurveillanceEvent.detected_at.desc(),
        )
        if camera_id is not None:
            statement = statement.where(SurveillanceEvent.camera_id == camera_id)

        return list(self.db.scalars(statement).all())

    def count_events(self) -> int:
        """Return total number of stored surveillance events."""
        statement = select(func.count()).select_from(SurveillanceEvent)
        return int(self.db.scalar(statement) or 0)

    def count_recent_events(self, hours: int = 24) -> int:
        """Return number of events detected within the given hour window."""
        since = datetime.now(UTC) - timedelta(hours=hours)
        statement = (
            select(func.count())
            .select_from(SurveillanceEvent)
            .where(SurveillanceEvent.detected_at >= since)
        )
        return int(self.db.scalar(statement) or 0)

    def count_events_by_severity(self, severity: str) -> int:
        """Return number of events for one severity label."""
        statement = (
            select(func.count())
            .select_from(SurveillanceEvent)
            .where(SurveillanceEvent.severity == severity)
        )
        return int(self.db.scalar(statement) or 0)

    def get_event(self, event_id: int) -> SurveillanceEvent | None:
        """Return an event by id when it exists."""
        return self.db.get(SurveillanceEvent, event_id)

    def create_event(self, payload: SurveillanceEventCreate) -> SurveillanceEvent:
        """Create and persist a surveillance event."""
        event = SurveillanceEvent(**payload.model_dump())
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event
