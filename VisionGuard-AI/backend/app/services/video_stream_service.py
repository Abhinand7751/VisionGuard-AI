from collections.abc import Generator
from datetime import UTC, datetime
from pathlib import Path
from time import sleep

import cv2
from loguru import logger

from app.core.config import settings


class VideoStreamService:
    """Service for reading camera frames and producing MJPEG chunks."""

    def open_capture(self, source: str) -> cv2.VideoCapture:
        """Open an OpenCV capture for a numeric device index or URL."""
        capture_source: int | str = int(source) if source.isdigit() else source
        capture = cv2.VideoCapture(capture_source)

        if settings.stream_frame_width > 0:
            capture.set(cv2.CAP_PROP_FRAME_WIDTH, settings.stream_frame_width)
        if settings.stream_frame_height > 0:
            capture.set(cv2.CAP_PROP_FRAME_HEIGHT, settings.stream_frame_height)

        return capture

    def check_source(self, source: str) -> tuple[bool, str]:
        """Return whether a camera source can be opened and read."""
        capture = self.open_capture(source)
        try:
            if not capture.isOpened():
                return False, "Camera source could not be opened."

            success, _ = capture.read()
            if not success:
                return False, "Camera source opened but did not return a frame."

            return True, "Camera source is reachable."
        finally:
            capture.release()

    def capture_snapshot(self, camera_id: int, source: str) -> tuple[Path, str]:
        """Capture one JPEG snapshot from a camera source."""
        capture = self.open_capture(source)
        try:
            if not capture.isOpened():
                raise RuntimeError("Camera source could not be opened.")

            success, frame = capture.read()
            if not success:
                raise RuntimeError("Camera source opened but did not return a frame.")

            storage_dir = Path(settings.snapshot_storage_dir)
            storage_dir.mkdir(parents=True, exist_ok=True)

            timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S_%f")
            filename = f"camera_{camera_id}_{timestamp}.jpg"
            snapshot_path = storage_dir / filename

            encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), settings.stream_jpeg_quality]
            saved = cv2.imwrite(str(snapshot_path), frame, encode_params)
            if not saved:
                raise RuntimeError("Snapshot could not be written to disk.")

            public_url = f"{settings.snapshot_public_path.rstrip('/')}/{filename}"
            return snapshot_path, public_url
        finally:
            capture.release()

    def iter_mjpeg_frames(
        self,
        capture: cv2.VideoCapture,
    ) -> Generator[bytes, None, None]:
        """Yield frames encoded as multipart MJPEG chunks."""
        frame_delay = 1 / settings.stream_target_fps
        encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), settings.stream_jpeg_quality]

        try:
            while True:
                success, frame = capture.read()
                if not success:
                    logger.warning("Unable to read frame from camera source.")
                    break

                encoded, buffer = cv2.imencode(".jpg", frame, encode_params)
                if not encoded:
                    logger.warning("Unable to encode frame as JPEG.")
                    continue

                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n"
                    + buffer.tobytes()
                    + b"\r\n"
                )
                sleep(frame_delay)
        finally:
            capture.release()
