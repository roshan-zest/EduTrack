import { AlertItem } from "@/lib/types";

const severityClass: Record<AlertItem["severity"], string> = {
  low: "border-emerald-200/70 bg-white/75 text-emerald-900",
  medium: "border-amber-200/70 bg-white/75 text-amber-900",
  high: "border-rose-200/70 bg-white/75 text-rose-900"
};

export function AlertList({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className={`glass-panel rounded-[1.5rem] border p-5 ${severityClass[alert.severity]}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.28em]">{alert.severity} alert</p>
          <p className="mt-3 text-lg font-semibold tracking-[-0.03em]">{alert.teacherName}</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{alert.message}</p>
        </div>
      ))}
    </div>
  );
}
