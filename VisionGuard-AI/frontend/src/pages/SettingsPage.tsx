import { Database, Globe2, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getHealthStatus,
  type HealthStatus,
} from "../services/surveillanceApi";

export function SettingsPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    async function loadHealth() {
      try {
        setHealth(await getHealthStatus());
      } catch {
        setHealth(null);
      }
    }

    void loadHealth();
  }, []);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-white">Settings</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Environment-driven configuration keeps deployment behavior outside the
          source code.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "API Base URL",
            value:
              import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
            icon: Globe2,
          },
          {
            title: "Database",
            value: health?.database ?? "Health check unavailable",
            icon: Database,
          },
          {
            title: "Service",
            value: health
              ? `${health.service} is ${health.status} in ${health.environment}`
              : "Backend health check unavailable",
            icon: SlidersHorizontal,
          },
        ].map((item) => (
          <section
            key={item.title}
            className="rounded-lg border border-white/10 bg-surface-850 p-5 shadow-panel"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-500/10 text-accent-500">
                <item.icon aria-hidden="true" size={20} />
              </div>
              <h3 className="text-base font-semibold text-white">{item.title}</h3>
            </div>
            <p className="mt-4 break-words text-sm leading-6 text-slate-400">
              {item.value}
            </p>
          </section>
        ))}
      </section>
    </div>
  );
}
