from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = Field(default="VisionGuard AI", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    app_debug: bool = Field(default=False, alias="APP_DEBUG")
    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=8000, alias="APP_PORT")
    app_log_level: str = Field(default="INFO", alias="APP_LOG_LEVEL")
    api_v1_prefix: str = "/api/v1"
    auth_secret_key: str = Field(
        default="change-this-secret-before-production",
        alias="AUTH_SECRET_KEY",
    )
    auth_algorithm: str = "HS256"
    auth_access_token_expire_minutes: int = Field(
        default=1440,
        alias="AUTH_ACCESS_TOKEN_EXPIRE_MINUTES",
    )
    initial_admin_email: str = Field(
        default="admin@visionguard.local",
        alias="INITIAL_ADMIN_EMAIL",
    )
    initial_admin_password: str = Field(
        default="ChangeMe123!",
        alias="INITIAL_ADMIN_PASSWORD",
    )
    stream_frame_width: int = Field(default=640, alias="STREAM_FRAME_WIDTH")
    stream_frame_height: int = Field(default=480, alias="STREAM_FRAME_HEIGHT")
    stream_target_fps: int = Field(default=15, alias="STREAM_TARGET_FPS")
    stream_jpeg_quality: int = Field(default=80, alias="STREAM_JPEG_QUALITY")
    snapshot_storage_dir: str = Field(
        default="storage/snapshots",
        alias="SNAPSHOT_STORAGE_DIR",
    )
    snapshot_public_path: str = Field(
        default="/storage/snapshots",
        alias="SNAPSHOT_PUBLIC_PATH",
    )
    yolo_model_path: str = Field(
        default="/ai_models/yolov8n.pt",
        alias="YOLO_MODEL_PATH",
    )
    yolo_confidence_threshold: float = Field(
        default=0.35,
        alias="YOLO_CONFIDENCE_THRESHOLD",
    )
    detection_storage_dir: str = Field(
        default="storage/detections",
        alias="DETECTION_STORAGE_DIR",
    )
    detection_public_path: str = Field(
        default="/storage/detections",
        alias="DETECTION_PUBLIC_PATH",
    )
    database_url: str = Field(
        default="postgresql+psycopg://visionguard:visionguard_password@localhost:5432/visionguard_ai",
        alias="DATABASE_URL",
    )
    backend_cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        alias="BACKEND_CORS_ORIGINS",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        """Return parsed CORS origins from comma-separated settings."""
        return [
            origin.strip()
            for origin in self.backend_cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""
    return Settings()


settings = get_settings()
