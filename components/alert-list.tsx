import { AlertItem } from "@/lib/types";

const severityClass: Record<AlertItem["severity"], string> = {
  low: "border-emerald-200/70 bg-gradient-to-br from-white via-white to-emerald-50/80 text-emerald-900",
  medium: "border-amber-200/70 bg-gradient-to-br from-white via-white to-amber-50/80 text-amber-900",
  high: "border-rose-200/70 bg-gradient-to-br from-white via-white to-rose-50/80 text-rose-900"
};

export function AlertList({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className={`glass-panel card-hover rounded-[1.7rem] border p-5 ${severityClass[alert.severity]}`}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em]">{alert.severity} alert</p>
            <span className={`status-dot ${alert.severity === "low" ? "bg-emerald-500" : alert.severity === "medium" ? "bg-amber-500" : "bg-rose-500"}`} />
          </div>
          <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-slate-800">{alert.teacherName}</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{alert.message}</p>
        </div>
      ))}
    </div>
  );
}
