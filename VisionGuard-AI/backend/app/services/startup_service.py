from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services.user_service import UserService


def ensure_initial_admin(db: Session) -> None:
    """Create the initial admin user when it does not already exist."""
    service = UserService(db)
    existing_user = service.get_by_email(settings.initial_admin_email)
    if existing_user is not None:
        return

    service.create_user(
        email=settings.initial_admin_email,
        password=settings.initial_admin_password,
        full_name="VisionGuard Admin",
        is_superuser=True,
    )
    logger.info("Initial admin user created: {}", settings.initial_admin_email)
