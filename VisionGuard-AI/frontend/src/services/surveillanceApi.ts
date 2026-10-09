import { apiBaseUrl, apiClient } from "./api";
import { getStoredToken } from "../auth/authStorage";

export type Camera = {
  id: number;
  name: string;
  stream_url: string;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SurveillanceEvent = {
  id: number;
  camera_id: number;
  event_type: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  description: string | null;
  snapshot_url: string | null;
  detected_at: string;
  created_at: string;
};

export type EventSeverity = SurveillanceEvent["severity"];

export type HealthStatus = {
  status: "ready" | "degraded" | string;
  service: string;
  environment: string;
  database: "connected" | "unavailable" | string;
};

export type DashboardSummary = {
  total_cameras: number;
  active_cameras: number;
  total_events: number;
  latest_events: number;
  critical_events: number;
  high_events: number;
  detection_status: string;
  highest_severity: EventSeverity | null;
};

export type StreamHealthStatus = {
  camera_id: number;
  status: "ready" | "unavailable" | string;
  message: string;
};

export type SnapshotResult = {
  camera_id: number;
  event_id: number;
  snapshot_url: string;
  message: string;
};

export type DetectionObject = {
  class_name: string;
  confidence: number;
  bbox: number[];
};

export type DetectionResult = {
  camera_id: number;
  event_id: number | null;
  detections: DetectionObject[];
  snapshot_url: string;
  annotated_snapshot_url: string | null;
  message: string;
};

export type CameraPayload = {
  name: string;
  stream_url: string;
  location?: string | null;
  is_active: boolean;
};

export type EventFilters = {
  cameraId?: number;
};

export type SurveillanceEventPayload = {
  camera_id: number;
  event_type: string;
  severity: EventSeverity;
  description?: string | null;
  snapshot_url?: string | null;
};

export async function listCameras(): Promise<Camera[]> {
  const response = await apiClient.get<Camera[]>("/cameras");
  return response.data;
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const response = await apiClient.get<HealthStatus>("/health");
  return response.data;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummary>("/dashboard/summary");
  return response.data;
}

export async function createCamera(payload: CameraPayload): Promise<Camera> {
  const response = await apiClient.post<Camera>("/cameras", payload);
  return response.data;
}

export async function updateCamera(
  cameraId: number,
  payload: Partial<CameraPayload>,
): Promise<Camera> {
  const response = await apiClient.patch<Camera>(`/cameras/${cameraId}`, payload);
  return response.data;
}

export async function deleteCamera(cameraId: number): Promise<void> {
  await apiClient.delete(`/cameras/${cameraId}`);
}

export async function listEvents(
  filters: EventFilters = {},
): Promise<SurveillanceEvent[]> {
  const response = await apiClient.get<SurveillanceEvent[]>("/events", {
    params: {
      camera_id: filters.cameraId,
    },
  });
  return response.data;
}

export async function createEvent(
  payload: SurveillanceEventPayload,
): Promise<SurveillanceEvent> {
  const response = await apiClient.post<SurveillanceEvent>("/events", payload);
  return response.data;
}

export function getCameraMjpegStreamUrl(cameraId: number): string {
  const token = getStoredToken();
  const url = new URL(`${apiBaseUrl}/stream/cameras/${cameraId}/mjpeg`);
  if (token) {
    url.searchParams.set("token", token);
  }
  return url.toString();
}

export async function checkCameraStreamHealth(
  cameraId: number,
): Promise<StreamHealthStatus> {
  const response = await apiClient.get<StreamHealthStatus>(
    `/stream/cameras/${cameraId}/health`,
  );
  return response.data;
}

export async function captureCameraSnapshot(
  cameraId: number,
): Promise<SnapshotResult> {
  const response = await apiClient.post<SnapshotResult>(
    `/stream/cameras/${cameraId}/snapshot`,
  );
  return response.data;
}

export async function runYoloDetection(cameraId: number): Promise<DetectionResult> {
  const response = await apiClient.post<DetectionResult>(
    `/detection/cameras/${cameraId}/yolo`,
  );
  return response.data;
}

export function getPublicAssetUrl(pathOrUrl: string | null): string | null {
  if (!pathOrUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const backendOrigin = new URL(apiBaseUrl).origin;
  return new URL(pathOrUrl, backendOrigin).toString();
}
