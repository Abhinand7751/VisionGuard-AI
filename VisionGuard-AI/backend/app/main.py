from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.database.session import SessionLocal
from app.services.startup_service import ensure_initial_admin


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    configure_logging()

    app = FastAPI(
        title=settings.app_name,
        debug=settings.app_debug,
        version="0.1.0",
        description="Real-time CCTV surveillance and threat detection platform.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.api_v1_prefix)
    app.mount("/storage", StaticFiles(directory="storage"), name="storage")

    @app.on_event("startup")
    def create_initial_admin() -> None:
        """Ensure a development admin user exists after migrations run."""
        db = SessionLocal()
        try:
            ensure_initial_admin(db)
        except Exception as exc:
            logger.warning("Initial admin setup skipped: {}", exc)
        finally:
            db.close()

    return app


app = create_app()
