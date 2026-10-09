import sys

from loguru import logger

from app.core.config import settings


def configure_logging() -> None:
    """Configure structured application logging."""
    logger.remove()
    logger.add(
        sys.stdout,
        level=settings.app_log_level,
        colorize=True,
        backtrace=settings.app_debug,
        diagnose=settings.app_debug,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        ),
    )
