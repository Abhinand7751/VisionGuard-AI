import {
  Clock,
  ExternalLink,
  Filter,
  ImageOff,
  Plus,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import {
  createEvent,
  getPublicAssetUrl,
  listCameras,
  listEvents,
  type Camera,
  type EventSeverity,
  type SurveillanceEvent,
  type SurveillanceEventPayload,
} from "../services/surveillanceApi";

const severityOptions = [
  "all",
  "info",
  "low",
  "medium",
  "high",
  "critical",
] as const;
type SeverityFilter = (typeof severityOptions)[number];

const eventTypeOptions = [
  "manual_review",
  "restricted_area",
  "perimeter_check",
  "safety_observation",
] as const;

export function EventsPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [events, setEvents] = useState<SurveillanceEvent[]>([]);
  const [status, setStatus] = useState("Loading events");
  const [selectedCameraId, setSelectedCameraId] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>("all");
  const [isSaving, setIsSaving] = useState(false);
  const [eventForm, setEventForm] = useState({
    cameraId: "",
    eventType: "manual_review",
    severity: "info" as EventSeverity,
    description: "",
    snapshotUrl: "",
  });

  const loadEvents = useCallback(async () => {
    try {
      const cameraId =
        selectedCameraId === "all" ? undefined : Number(selectedCameraId);
      const data = await listEvents({ cameraId });
      setEvents(data);
      setStatus(data.length === 0 ? "No events recorded yet" : "Events loaded");
    } catch {
      setStatus("Event API unavailable");
    }
  }, [selectedCameraId]);

  useEffect(() => {
    async function loadCameras() {
      try {
        setCameras(await listCameras());
      } catch {
        setCameras([]);
      }
    }

    void loadCameras();
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const visibleEvents =
    selectedSeverity === "all"
      ? events
      : events.filter((event) => event.severity === selectedSeverity);

  const activeCameras = useMemo(
    () => cameras.filter((camera) => camera.is_active),
    [cameras],
  );

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventForm.cameraId) {
      setStatus("Select a camera before recording an event");
      return;
    }

    const payload: SurveillanceEventPayload = {
      camera_id: Number(eventForm.cameraId),
      event_type: eventForm.eventType,
      severity: eventForm.severity,
      description: eventForm.description.trim() || null,
      snapshot_url: eventForm.snapshotUrl.trim() || null,
    };

    setIsSaving(true);
    try {
      await createEvent(payload);
      setStatus("Event recorded");
      setEventForm((current) => ({
        ...current,
        description: "",
        snapshotUrl: "",
      }));
      await loadEvents();
    } catch {
      setStatus("Unable to record event");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-white">Events</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Event history and alert workflows are prepared as product surfaces for
          later backend modules.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleCreateEvent}
          className="rounded-lg border border-white/10 bg-surface-850 p-5 shadow-panel"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-white">Record Event</h3>
            <div className="rounded-md bg-signal-500/10 p-2 text-signal-500">
              <ShieldAlert aria-hidden="true" size={18} />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block text-sm">
              <span className="text-slate-300">Camera</span>
              <select
                required
                value={eventForm.cameraId}
                onChange={(event) =>
                  setEventForm((current) => ({
                    ...current,
                    cameraId: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
              >
                <option value="">Select camera</option>
                {activeCameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Event Type</span>
              <select
                value={eventForm.eventType}
                onChange={(event) =>
                  setEventForm((current) => ({
                    ...current,
                    eventType: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
              >
                {eventTypeOptions.map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {eventType.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Severity</span>
              <select
                value={eventForm.severity}
                onChange={(event) =>
                  setEventForm((current) => ({
                    ...current,
                    severity: event.target.value as EventSeverity,
                  }))
                }
                className="mt-2 w-full rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
              >
                {severityOptions
                  .filter((severity) => severity !== "all")
                  .map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Description</span>
              <textarea
                value={eventForm.description}
                onChange={(event) =>
                  setEventForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="mt-2 min-h-24 w-full resize-y rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
                placeholder="Operator note for this event"
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Snapshot URL</span>
              <input
                value={eventForm.snapshotUrl}
                onChange={(event) =>
                  setEventForm((current) => ({
                    ...current,
                    snapshotUrl: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
                placeholder="https://storage.local/snapshot.jpg"
              />
            </label>

            <button
              type="submit"
              disabled={isSaving || activeCameras.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-surface-950 transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus aria-hidden="true" size={18} />
              {isSaving ? "Recording" : "Record Event"}
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-white/10 bg-surface-850 p-5 shadow-panel">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <label className="block text-sm">
              <span className="flex items-center gap-2 text-slate-300">
                <Filter aria-hidden="true" size={16} />
                Camera
              </span>
              <select
                value={selectedCameraId}
                onChange={(event) => setSelectedCameraId(event.target.value)}
                className="mt-2 w-full rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
              >
                <option value="all">All cameras</option>
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Severity</span>
              <select
                value={selectedSeverity}
                onChange={(event) =>
                  setSelectedSeverity(event.target.value as SeverityFilter)
                }
                className="mt-2 w-full rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
              >
                {severityOptions.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity === "all" ? "All severities" : severity}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => void loadEvents()}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-white/10 px-4 text-sm font-medium text-slate-200 transition hover:bg-white/5 lg:w-auto"
              >
                <RefreshCcw aria-hidden="true" size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-white/10 bg-surface-850 shadow-panel">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <h3 className="text-base font-semibold text-white">Recent Events</h3>
          <p className="text-sm text-slate-400">
            {visibleEvents.length} shown
          </p>
        </div>
        <div className="divide-y divide-white/10">
          {visibleEvents.length === 0 ? (
            <div className="px-5 py-8 text-sm text-slate-400">{status}</div>
          ) : (
            visibleEvents.map((event) => {
              const snapshotUrl = getPublicAssetUrl(event.snapshot_url);

              return (
              <div
                key={event.id}
                className="grid gap-4 px-5 py-4 md:grid-cols-[96px_minmax(0,1fr)_auto]"
              >
                <div className="flex h-20 w-24 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-surface-900 text-slate-500">
                  {snapshotUrl ? (
                    <img
                      src={snapshotUrl}
                      alt={`${event.event_type} snapshot`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <ImageOff aria-hidden="true" size={22} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {event.event_type} on {cameraName(event.camera_id, cameras)}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Clock aria-hidden="true" size={14} />
                    {event.severity} severity
                    <span>{formatEventDate(event.detected_at)}</span>
                  </p>
                  {event.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">
                      {event.description}
                    </p>
                  )}
                </div>
                {snapshotUrl && (
                  <a
                    href={snapshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-medium text-accent-500 transition hover:bg-white/5 hover:text-accent-600"
                  >
                    <ExternalLink aria-hidden="true" size={15} />
                    Image
                  </a>
                )}
              </div>
            );
            })
          )}
          {visibleEvents.length === 0 && (
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-signal-500/10 text-signal-500">
                <ShieldAlert aria-hidden="true" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">
                  Threat classification will be connected in a later AI module.
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <Clock aria-hidden="true" size={14} />
                  Detection events will appear after YOLO captures a result
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function cameraName(cameraId: number, cameras: Camera[]): string {
  return (
    cameras.find((camera) => camera.id === cameraId)?.name ?? `camera #${cameraId}`
  );
}

function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}