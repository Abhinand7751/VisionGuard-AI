import {
  Camera,
  CircleCheck,
  CircleOff,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  createCamera,
  deleteCamera,
  listCameras,
  updateCamera,
  type Camera as CameraSource,
  type CameraPayload,
} from "../services/surveillanceApi";

const emptyForm: CameraPayload = {
  name: "",
  stream_url: "",
  location: "",
  is_active: true,
};

export function CamerasPage() {
  const [cameras, setCameras] = useState<CameraSource[]>([]);
  const [form, setForm] = useState<CameraPayload>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState("Loading camera registry");
  const [isSaving, setIsSaving] = useState(false);

  const activeCount = useMemo(
    () => cameras.filter((camera) => camera.is_active).length,
    [cameras],
  );

  async function loadCameras() {
    try {
      const data = await listCameras();
      setCameras(data);
      setStatus(
        data.length === 0 ? "No cameras registered yet" : "Registry loaded",
      );
    } catch {
      setStatus("Camera API unavailable");
    }
  }

  useEffect(() => {
    void loadCameras();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function editCamera(camera: CameraSource) {
    setEditingId(camera.id);
    setForm({
      name: camera.name,
      stream_url: camera.stream_url,
      location: camera.location ?? "",
      is_active: camera.is_active,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const payload = {
      ...form,
      location: form.location?.trim() ? form.location.trim() : null,
    };

    try {
      if (editingId === null) {
        await createCamera(payload);
        setStatus("Camera registered");
      } else {
        await updateCamera(editingId, payload);
        setStatus("Camera updated");
      }
      resetForm();
      await loadCameras();
    } catch {
      setStatus("Unable to save camera");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(cameraId: number) {
    try {
      await deleteCamera(cameraId);
      setStatus("Camera deleted");
      await loadCameras();
    } catch {
      setStatus("Unable to delete camera");
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Cameras</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Register CCTV sources for future streaming, detection, and event
            workflows.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:w-80">
          <div className="rounded-lg border border-white/10 bg-surface-850 p-4">
            <p className="text-xs text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-white">{cameras.length}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-surface-850 p-4">
            <p className="text-xs text-slate-500">Active</p>
            <p className="mt-2 text-2xl font-semibold text-accent-500">
              {activeCount}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-white/10 bg-surface-850 p-5 shadow-panel"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-white">
              {editingId === null ? "Register Camera" : "Edit Camera"}
            </h3>
            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-300 hover:bg-white/5"
                aria-label="Cancel editing"
              >
                <X aria-hidden="true" size={18} />
              </button>
            )}
          </div>

          <div className="mt-5 space-y-4">
            <label className="block text-sm">
              <span className="text-slate-300">Name</span>
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="mt-2 w-full rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
                placeholder="Warehouse Entrance"
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Stream URL</span>
              <input
                required
                value={form.stream_url}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    stream_url: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
                placeholder="rtsp://camera.local/stream"
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Location</span>
              <input
                value={form.location ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-500"
                placeholder="North gate"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-surface-900 px-3 py-3 text-sm">
              <span className="text-slate-300">Active camera</span>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_active: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-teal-400"
              />
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-surface-950 transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editingId === null ? (
                <Plus aria-hidden="true" size={18} />
              ) : (
                <Save aria-hidden="true" size={18} />
              )}
              {isSaving
                ? "Saving"
                : editingId === null
                  ? "Add Camera"
                  : "Save Changes"}
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-lg border border-white/10 bg-surface-850 shadow-panel">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <h3 className="text-base font-semibold text-white">Camera Registry</h3>
            <p className="text-sm text-slate-400">{status}</p>
          </div>

          <div className="divide-y divide-white/10">
            {cameras.length === 0 ? (
              <div className="px-5 py-8 text-sm text-slate-400">
                Add a camera source to prepare the surveillance workflow.
              </div>
            ) : (
              cameras.map((camera) => (
                <div
                  key={camera.id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]"
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent-500/10 text-accent-500">
                      <Camera aria-hidden="true" size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-white">{camera.name}</p>
                        <span
                          className={[
                            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                            camera.is_active
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-slate-500/10 text-slate-400",
                          ].join(" ")}
                        >
                          {camera.is_active ? (
                            <CircleCheck aria-hidden="true" size={13} />
                          ) : (
                            <CircleOff aria-hidden="true" size={13} />
                          )}
                          {camera.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-400">
                        {camera.stream_url}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {camera.location ?? "No location set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => editCamera(camera)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-300 transition hover:bg-white/5"
                      aria-label={`Edit ${camera.name}`}
                    >
                      <Pencil aria-hidden="true" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(camera.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-400/20 text-red-300 transition hover:bg-red-400/10"
                      aria-label={`Delete ${camera.name}`}
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
