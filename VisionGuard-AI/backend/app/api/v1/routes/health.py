from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.health import check_database_connection
from app.database.session import get_db
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)) -> HealthResponse:
    """Return the API health status."""
    database_is_ready = check_database_connection(db)

    return HealthResponse(
        status="ready" if database_is_ready else "degraded",
        service=settings.app_name,
        environment=settings.app_env,
        database="connected" if database_is_ready else "unavailable",
    )
