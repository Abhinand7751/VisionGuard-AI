from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.camera import Camera
from app.schemas.camera import CameraCreate, CameraUpdate


class CameraService:
    """Application service for camera registry operations."""

    def __init__(self, db: Session) -> None:
        """Initialize the service with a database session."""
        self.db = db

    def list_cameras(self) -> list[Camera]:
        """Return all cameras ordered by newest first."""
        statement = select(Camera).order_by(Camera.created_at.desc())
        return list(self.db.scalars(statement).all())

    def count_cameras(self) -> int:
        """Return total number of registered cameras."""
        statement = select(func.count()).select_from(Camera)
        return int(self.db.scalar(statement) or 0)

    def count_active_cameras(self) -> int:
        """Return total number of active registered cameras."""
        statement = select(func.count()).select_from(Camera).where(
            Camera.is_active.is_(True),
        )
        return int(self.db.scalar(statement) or 0)

    def get_camera(self, camera_id: int) -> Camera | None:
        """Return a camera by id when it exists."""
        return self.db.get(Camera, camera_id)

    def create_camera(self, payload: CameraCreate) -> Camera:
        """Create and persist a camera."""
        camera = Camera(**payload.model_dump())
        self.db.add(camera)
        self.db.commit()
        self.db.refresh(camera)
        return camera

    def update_camera(self, camera: Camera, payload: CameraUpdate) -> Camera:
        """Update an existing camera with provided fields."""
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(camera, field, value)

        self.db.add(camera)
        self.db.commit()
        self.db.refresh(camera)
        return camera

    def delete_camera(self, camera: Camera) -> None:
        """Delete a camera and its dependent events."""
        self.db.delete(camera)
        self.db.commit()
