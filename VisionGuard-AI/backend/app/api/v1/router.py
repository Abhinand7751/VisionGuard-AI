from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.api.v1.routes import (
    auth,
    cameras,
    dashboard,
    detection,
    events,
    health,
    stream,
    tracking,
    tracking_worker,
)

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    health.router,
    prefix="/health",
    tags=["health"],
)

api_router.include_router(
    stream.router,
    prefix="/stream",
    tags=["stream"],
)

api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(get_current_user)],
)

api_router.include_router(
    cameras.router,
    prefix="/cameras",
    tags=["cameras"],
    dependencies=[Depends(get_current_user)],
)

api_router.include_router(
    events.router,
    prefix="/events",
    tags=["events"],
    dependencies=[Depends(get_current_user)],
)

api_router.include_router(
    detection.router,
    prefix="/detection",
    tags=["detection"],
    dependencies=[Depends(get_current_user)],
)

api_router.include_router(
    tracking.router,
    prefix="/tracking",
    tags=["tracking"],
    dependencies=[Depends(get_current_user)],
)

api_router.include_router(
    tracking_worker.router,
    prefix="/tracking-worker",
    tags=["tracking-worker"],
    dependencies=[Depends(get_current_user)],
)
