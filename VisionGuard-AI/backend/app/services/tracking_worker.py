import threading
import time
from typing import Any

from loguru import logger

from app.services.tracking_service import tracking_service


class TrackingWorker:
    """Background worker for continuous YOLO + ByteTrack processing."""

    def __init__(self) -> None:
        self._threads: dict[int, threading.Thread] = {}
        self._running: dict[int, bool] = {}
        self._latest_tracks: dict[int, list[dict[str, Any]]] = {}

    def start(self, camera_id: int, stream_url: str) -> None:
        """Start tracking for a camera if it is not already running."""

        if self.is_running(camera_id):
            logger.info("Tracking already running for camera {}", camera_id)
            return

        self._running[camera_id] = True

        thread = threading.Thread(
            target=self._run,
            args=(camera_id, stream_url),
            daemon=True,
            name=f"tracking-camera-{camera_id}",
        )

        self._threads[camera_id] = thread
        thread.start()

        logger.info("Tracking worker started for camera {}", camera_id)

    def stop(self, camera_id: int) -> None:
        """Stop tracking for a camera."""

        self._running[camera_id] = False

        thread = self._threads.get(camera_id)

        if thread is not None and thread.is_alive():
            thread.join(timeout=3)

        self._threads.pop(camera_id, None)
        self._latest_tracks.pop(camera_id, None)

        logger.info("Tracking worker stopped for camera {}", camera_id)

    def is_running(self, camera_id: int) -> bool:
        """Return whether tracking is currently running."""

        thread = self._threads.get(camera_id)

        return bool(
            self._running.get(camera_id, False)
            and thread is not None
            and thread.is_alive()
        )

    def get_latest_tracks(self, camera_id: int) -> list[dict[str, Any]]:
        """Return the latest tracked objects for a camera."""

        return self._latest_tracks.get(camera_id, [])

    def _run(self, camera_id: int, stream_url: str) -> None:
        """Run the continuous tracking loop."""

        try:
            results = tracking_service.track_camera(
                camera_id,
                stream_url,
            )

            for result in results:
                if not self._running.get(camera_id, False):
                    break

                tracks = tracking_service.extract_tracks(result)
                self._latest_tracks[camera_id] = tracks

        except Exception as exc:
            logger.exception(
                "Tracking worker failed for camera {}: {}",
                camera_id,
                exc,
            )

        finally:
            self._running[camera_id] = False
            logger.info(
                "Tracking worker exited for camera {}",
                camera_id,
            )


tracking_worker = TrackingWorker()
