import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  CircleAlert,
  Server,
  ShieldCheck,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  getCameraMjpegStreamUrl,
  getDashboardSummary,
  getPublicAssetUrl,
  listCameras,
  listEvents,
  type DashboardSummary,
} from "../services/surveillanceApi";

type CameraItem = Awaited<ReturnType<typeof listCameras>>[number];
type EventItem = Awaited<ReturnType<typeof listEvents>>[number];

function statusClass(status: string) {
  if (status === "Online") {
    return "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
  }

  if (status === "Offline") {
    return "text-red-300 bg-red-400/10 border-red-400/20";
  }

  return "text-amber-300 bg-amber-400/10 border-amber-400/20";
}

function getThreatLevel(severity: string | null) {
  if (severity === "critical") {
    return {
      label: "CRITICAL",
      description: "Critical event recorded. Review immediately.",
      ringClass: "border-red-500/70",
      iconClass: "text-red-300",
    };
  }

  if (severity === "high") {
    return {
      label: "ELEVATED",
      description: "High severity event activity detected.",
      ringClass: "border-amber-500/70",
      iconClass: "text-amber-300",
    };
  }

  if (severity === "medium") {
    return {
      label: "MONITORING",
      description: "Medium severity events are being tracked.",
      ringClass: "border-sky-500/70",
      iconClass: "text-sky-300",
    };
  }

  return {
    label: "STABLE",
    description: "No high-priority events are active.",
    ringClass: "border-emerald-500/70",
    iconClass: "text-emerald-300",
  };
}

export function DashboardPage() {
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [apiStatus, setApiStatus] = useState("Checking");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [cameraData, eventData, summaryData] = await Promise.all([
          listCameras(),
          listEvents(),
          getDashboardSummary(),
        ]);

        setCameras(cameraData);
        setEvents(eventData);
        setSummary(summaryData);
        setApiStatus("Online");
      } catch {
        setApiStatus("Offline");
      }
    }

    void loadDashboard();
  }, []);

  const activeCameras = useMemo(
    () => cameras.filter((camera) => camera.is_active),
    [cameras],
  );

  const recentEvents = useMemo(
    () =>
      [...events]
        .sort((a, b) => {
          return (
            new Date(b.detected_at).getTime() -
            new Date(a.detected_at).getTime()
          );
        })
        .slice(0, 6),
    [events],
  );
  const threatLevel = getThreatLevel(summary?.highest_severity ?? null);

  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-400">
              Security Operations
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Dashboard
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Central monitoring overview for cameras, surveillance events,
              system health, and AI detection services.
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${statusClass(apiStatus)}`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            API {apiStatus}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric
          label="Cameras Online"
          value={String(summary?.active_cameras ?? activeCameras.length)}
          detail={`${summary?.total_cameras ?? cameras.length} registered camera${(summary?.total_cameras ?? cameras.length) === 1 ? "" : "s"}`}
          icon={Camera}
          tone="blue"
        />

        <DashboardMetric
          label="Recorded Events"
          value={String(summary?.total_events ?? events.length)}
          detail={`${summary?.latest_events ?? recentEvents.length} event${(summary?.latest_events ?? recentEvents.length) === 1 ? "" : "s"} in the last 24 hours`}
          icon={Activity}
          tone="amber"
        />

        <DashboardMetric
          label="Active Alerts"
          value={String(
            (summary?.critical_events ?? 0) + (summary?.high_events ?? 0),
          )}
          detail="High and critical surveillance events"
          icon={AlertTriangle}
          tone="red"
        />

        <DashboardMetric
          label="Detection Engine"
          value={summary?.detection_status ?? "YOLO"}
          detail="Object detection available"
          icon={ShieldCheck}
          tone="green"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-surface-850 shadow-panel">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Live Camera Overview
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Registered surveillance sources
              </p>
            </div>

            <Video size={18} className="text-accent-400" />
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {cameras.length > 0 ? (
              cameras.slice(0, 6).map((camera) => (
                <CameraPreviewCard key={camera.id} camera={camera} />
              ))
            ) : (
              <EmptyState
                icon={Camera}
                title="No cameras registered"
                description="Add a camera to begin surveillance monitoring."
              />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-surface-850 shadow-panel">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Threat Intelligence
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  AI security analysis
                </p>
              </div>

              <ShieldCheck size={18} className="text-accent-400" />
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="rounded-xl border border-white/10 bg-black/10 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Current Threat Level
              </p>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-300">
                    {threatLevel.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {threatLevel.description}
                  </p>
                </div>

                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-4 ${threatLevel.ringClass}`}
                >
                  <ShieldCheck size={24} className={threatLevel.iconClass} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-white/10 p-5">
              <div className="flex items-center gap-3">
                <CircleAlert size={20} className="text-amber-400" />

                <div>
                  <p className="text-sm font-medium text-white">
                    AI Threat Analysis
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    YOLO detection now records event severity. ByteTrack,
                    face recognition, and automated alert escalation are planned
                    for later phases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-surface-850 shadow-panel">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Recent Events
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Latest events recorded by VisionGuard
              </p>
            </div>

            <Activity size={18} className="text-accent-400" />
          </div>

          {recentEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3 font-medium">Time</th>
                    <th className="px-5 py-3 font-medium">Camera</th>
                    <th className="px-5 py-3 font-medium">Event</th>
                    <th className="px-5 py-3 font-medium">Severity</th>
                  </tr>
                </thead>

                <tbody>
                  {recentEvents.map((event) => (
                    <tr
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="cursor-pointer border-b border-white/5 last:border-0 transition hover:bg-accent-500/[0.05]"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-400">
                        {new Date(event.detected_at).toLocaleTimeString()}
                      </td>

                      <td className="px-5 py-3 text-xs text-slate-300">
                        Camera {event.camera_id}
                      </td>

                      <td className="px-5 py-3">
                        <p className="text-xs font-medium text-white">
                          {event.event_type}
                        </p>

                        {event.description && (
                          <p className="mt-1 max-w-xs truncate text-[10px] text-slate-500">
                            {event.description}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={(clickEvent) => {
                            clickEvent.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className="inline-flex cursor-pointer rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300 transition hover:border-accent-500/40 hover:bg-accent-500/10 hover:text-accent-300"
                        >
                          {event.severity}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="No events recorded"
              description="Surveillance events will appear here."
            />
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-surface-850 shadow-panel">
          <div className="border-b border-white/10 px-5 py-4">
            <h3 className="text-sm font-semibold text-white">
              Analytics Overview
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Current system activity
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4">
            <AnalyticsCard
              label="Registered Cameras"
              value={summary?.total_cameras ?? cameras.length}
              icon={Camera}
            />

            <AnalyticsCard
              label="Active Cameras"
              value={summary?.active_cameras ?? activeCameras.length}
              icon={CheckCircle2}
            />

            <AnalyticsCard
              label="Total Events"
              value={summary?.total_events ?? events.length}
              icon={Activity}
            />

            <AnalyticsCard
              label="API Status"
              value={apiStatus}
              icon={Server}
            />
          </div>

          <div className="mx-4 mb-4 rounded-lg border border-white/10 bg-black/10 p-4">
            <p className="text-xs font-medium text-slate-300">
              Detection pipeline
            </p>

            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
              <span className="rounded bg-accent-500/10 px-2 py-1 text-accent-300">
                Camera
              </span>

              <span>-&gt;</span>

              <span className="rounded bg-accent-500/10 px-2 py-1 text-accent-300">
                OpenCV
              </span>

              <span>-&gt;</span>

              <span className="rounded bg-accent-500/10 px-2 py-1 text-accent-300">
                YOLO
              </span>

              <span>-&gt;</span>

              <span className="rounded bg-accent-500/10 px-2 py-1 text-accent-300">
                ByteTrack
              </span>
            </div>
          </div>
        </div>
      </section>

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-surface-900 shadow-2xl"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Event Details
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Surveillance event information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Event Type
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {selectedEvent.event_type}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Severity
                  </p>
                  <p className="mt-1 text-sm font-medium uppercase text-accent-300">
                    {selectedEvent.severity}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Camera
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    Camera {selectedEvent.camera_id}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Detected
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {new Date(selectedEvent.detected_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Description
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {selectedEvent.description || "No description available."}
                </p>
              </div>

              {selectedEvent.snapshot_url && (
                <div className="overflow-hidden rounded-lg border border-white/10">
                  <img
                    src={getPublicAssetUrl(selectedEvent.snapshot_url) ?? ""}
                    alt="Event snapshot"
                    className="max-h-72 w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardMetric({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "blue" | "amber" | "red" | "green";
}) {
  const tones = {
    blue: "text-sky-300 bg-sky-400/10 border-sky-400/10",
    amber: "text-amber-300 bg-amber-400/10 border-amber-400/10",
    red: "text-red-300 bg-red-400/10 border-red-400/10",
    green: "text-emerald-300 bg-emerald-400/10 border-emerald-400/10",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface-850 p-5 shadow-panel transition hover:border-white/15">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div className={`rounded-lg border p-2.5 ${tones[tone]}`}>
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function CameraPreviewCard({ camera }: { camera: CameraItem }) {
  return (
    <div className="group overflow-hidden rounded-lg border border-white/10 bg-black/20">
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        {camera.is_active ? (
          <img
            src={getCameraMjpegStreamUrl(camera.id)}
            alt={`${camera.name} live camera feed`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Camera size={28} className="text-slate-700" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-black/75 px-2 py-1 backdrop-blur-sm">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              camera.is_active ? "bg-emerald-400" : "bg-red-400"
            }`}
          />

          <span className="text-[9px] font-semibold uppercase tracking-wide text-white">
            {camera.is_active ? "LIVE" : "OFFLINE"}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-2 pt-8">
          <p className="truncate text-xs font-semibold text-white">{camera.name}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 px-3 py-2">
        <p className="text-[10px] text-slate-500">Camera {camera.id}</p>

        <span
          className={`text-[10px] font-medium ${
            camera.is_active ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {camera.is_active ? "Streaming" : "Offline"}
        </span>
      </div>
    </div>
  );
}

function AnalyticsCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/10 p-3">
      <Icon size={16} className="text-accent-400" />

      <p className="mt-3 text-lg font-bold text-white">{value}</p>

      <p className="mt-1 text-[10px] leading-4 text-slate-500">{label}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="col-span-full flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-white/10 px-6 text-center">
      <Icon size={25} className="text-slate-600" />
      <p className="mt-3 text-sm font-medium text-slate-300">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}
