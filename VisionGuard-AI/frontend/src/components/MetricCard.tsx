import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export function MetricCard({ label, value, detail, icon: Icon }: MetricCardProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-surface-850 p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="rounded-md bg-accent-500/10 p-2 text-accent-500">
          <Icon aria-hidden="true" size={22} />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-400">{detail}</p>
    </section>
  );
}
