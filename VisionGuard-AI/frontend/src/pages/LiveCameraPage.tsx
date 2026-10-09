import {
  Activity,
  Camera,
  ImageDown,
  ScanSearch,
  PlayCircle,
  Square,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  captureCameraSnapshot,
  checkCameraStreamHealth,
  getCameraMjpegStreamUrl,
  getPublicAssetUrl,
  listCameras,
  runYoloDetection,
  type Camera as CameraSource,
  type DetectionResult,
  type SnapshotResult,
} from "../services/surveillanceApi";

export function LiveCameraPage() {
  const [cameras, setCameras] = useState<CameraSource[]>([]);
  const [status, setStatus] = useState("Loading camera registry");
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamHealth, setStreamHealth] = useState("Not checked");
  const [snapshot, setSnapshot] = useState<SnapshotResult | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    async function loadCameras() {
      try {
        const data = await listCameras();
        setCameras(data);
        setStatus(data.length === 0 ? "No cameras registered" : "Registry loaded");
        const firstActiveCamera = data.find((camera) => camera.is_active);
        if (firstActiveCamera) {
          setSelectedCameraId(firstActiveCamera.id);
        }
      } catch {
        setStatus("Camera API unavailable");
      }
    }

    void loadCameras();
  }, []);

  const activeCameras = useMemo(
    () => cameras.filter((camera) => camera.is_active),
    [cameras],
  );
  const selectedCamera = cameras.find((camera) => camera.id === selectedCameraId);
  const streamUrl =
    selectedCameraId !== null ? getCameraMjpegStreamUrl(selectedCameraId) : null;
  const snapshotUrl = getPublicAssetUrl(snapshot?.snapshot_url ?? null);
  const annotatedSnapshotUrl = getPublicAssetUrl(
    detectionResult?.annotated_snapshot_url ?? null,
  );

  async function handleCheckStream() {
    if (selectedCameraId === null) {
      setStreamHealth("Select a camera first");
      return;
    }

    setIsChecking(true);
    try {
      const result = await checkCameraStreamHealth(selectedCameraId);
      setStreamHealth(`${result.status}: ${result.message}`);
    } catch {
      setStreamHealth("Stream check failed");
    } finally {
      setIsChecking(false);
    }
  }

  async function handleCaptureSnapshot() {
    if (selectedCameraId === null) {
      setStatus("Select a camera before capturing");
      return;
    }

    setIsCapturing(true);
    try {
      const result = await captureCameraSnapshot(selectedCameraId);
      setSnapshot(result);
      setStatus(result.message);
    } catch {
      setStatus("Snapshot capture failed");
    } finally {
      setIsCapturing(false);
    }
  }

  async function handleRunDetection() {
    if (selectedCameraId === null) {
      setStatus("Select a camera before detection");
      return;
    }

    setIsDetecting(true);
    try {
      const result = await runYoloDetection(selectedCameraId);
      setDetectionResult(result);
      setStatus(result.message);
    } catch {
      setStatus("YOLO detection failed");
    } finally {
      setIsDetecting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-white">Live Camera</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Stream registered camera sources through the backend OpenCV MJPEG
          endpoint. Detection remains disabled until streaming is stable.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 aspect-video min-h-[280px] rounded-lg border border-white/10 bg-surface-900 shadow-panel">
          {isStreaming && streamUrl ? (
            <img
              src={streamUrl}
              alt={selectedCamera?.name ?? "Live camera stream"}
              className="h-full w-full rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 text-accent-500">
                <Video aria-hidden="true" size={34} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Stream Idle</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                  {selectedCamera
                    ? `${selectedCamera.name} is ready to stream.`
                    : "Add and activate a camera source before starting live view."}
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="min-w-0 overflow-hidden rounded-lg border border-white/10 bg-surface-850 p-5 shadow-panel">
          <h3 className="text-base font-semibold text-white">Camera Metadata</h3>
          <div className="mt-5 space-y-4">
            <label className="block text-sm">
              <span className="text-slate-300">Camera Source</span>
              <select
                value={selectedCameraId ?? ""}
                onChange={(event) => {
                  setSelectedCameraId(Number(event.target.value));
                  setIsStreaming(false);
                  setSnapshot(null);
                  setDetectionResult(null);
                  setStreamHealth("Not checked");
                }}
                className="mt-2 w-full rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
              >
                {activeCameras.length === 0 ? (
                  <option value="">No active cameras</option>
                ) : (
                  activeCameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <button
              type="button"
              disabled={selectedCameraId === null}
              onClick={() => setIsStreaming((current) => !current)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-surface-950 transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isStreaming ? (
                <Square aria-hidden="true" size={18} />
              ) : (
                <PlayCircle aria-hidden="true" size={18} />
              )}
              {isStreaming ? "Stop Stream" : "Start Stream"}
            </button>

            <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
              <button
                type="button"
                disabled={selectedCameraId === null || isChecking}
                onClick={() => void handleCheckStream()}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Activity aria-hidden="true" size={16} />
                {isChecking ? "Checking" : "Check Stream"}
              </button>
              <button
                type="button"
                disabled={selectedCameraId === null || isCapturing}
                onClick={() => void handleCaptureSnapshot()}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ImageDown aria-hidden="true" size={16} />
                {isCapturing ? "Capturing" : "Snapshot"}
              </button>
            </div>

            <button
              type="button"
              disabled={selectedCameraId === null || isDetecting}
              onClick={() => void handleRunDetection()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-signal-500/30 bg-signal-500/10 px-3 py-2 text-sm font-semibold text-signal-500 transition hover:bg-signal-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ScanSearch aria-hidden="true" size={17} />
              {isDetecting ? "Detecting" : "Run YOLO Detection"}
            </button>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Source</dt>
              <dd className="min-w-0 break-words text-right text-slate-200">
                {selectedCamera?.name ?? status}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Resolution</dt>
              <dd className="min-w-0 text-right text-slate-200">640x480 target</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Inference</dt>
              <dd className="min-w-0 text-right text-slate-200">Disabled</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Stream Health</dt>
              <dd className="min-w-0 break-words text-right text-slate-200">
                {streamHealth}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Endpoint</dt>
              <dd className="min-w-0 break-all text-right text-slate-200">
                /stream/cameras/id/mjpeg
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Registered</dt>
              <dd className="min-w-0 text-right text-slate-200">{cameras.length}</dd>
            </div>
          </dl>

          {snapshot && (
            <div className="mt-6 rounded-lg border border-white/10 bg-surface-900 p-3">
              <p className="text-sm font-medium text-white">Latest Snapshot</p>
              {snapshotUrl && (
                <>
                  <img
                    src={snapshotUrl}
                    alt="Latest camera snapshot"
                    className="mt-3 aspect-video w-full rounded-md border border-white/10 object-cover"
                  />
                  <a
                    href={snapshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block break-words text-sm text-accent-500 hover:text-accent-600"
                  >
                    Event #{snapshot.event_id}
                  </a>
                </>
              )}
            </div>
          )}

          {detectionResult && (
            <div className="mt-6 rounded-lg border border-white/10 bg-surface-900 p-3">
              <p className="text-sm font-medium text-white">YOLO Result</p>
              <p className="mt-2 text-sm text-slate-400">{detectionResult.message}</p>
              {annotatedSnapshotUrl && (
                <img
                  src={annotatedSnapshotUrl}
                  alt="YOLO annotated snapshot"
                  className="mt-3 aspect-video w-full rounded-md border border-white/10 object-cover"
                />
              )}
              {annotatedSnapshotUrl && (
                <a
                  href={annotatedSnapshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-words text-sm text-accent-500 hover:text-accent-600"
                >
                  View annotated snapshot
                </a>
              )}
              {detectionResult.detections.length > 0 && (
                <div className="mt-3 space-y-2">
                  {detectionResult.detections.slice(0, 5).map((item, index) => (
                    <div
                      key={`${item.class_name}-${index}`}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="text-slate-300">{item.class_name}</span>
                      <span className="text-slate-400">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
