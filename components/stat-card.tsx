type StatCardProps = {
  label: string;
  value: string;
  caption: string;
  trend?: string;
  tone?: "primary" | "neutral" | "success" | "warning";
  icon?: string;
};

const toneClass: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "kpi-card-primary",
  neutral: "kpi-card",
  success: "kpi-card border-emerald-200/70",
  warning: "kpi-card border-amber-200/70"
};

export function StatCard({ label, value, caption, trend, tone = "neutral", icon = "●" }: StatCardProps) {
  const primary = tone === "primary";

  return (
    <div className={`${toneClass[tone]} card-hover rounded-[1.9rem] p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.32em] ${primary ? "text-white/60" : "text-slate-400"}`}>
            {label}
          </p>
          <p className={`mt-4 text-4xl font-semibold tracking-[-0.05em] ${primary ? "text-white" : "text-slate-800"}`}>
            {value}
          </p>
        </div>
        <div className={`rounded-[1.1rem] px-3 py-2 text-sm ${primary ? "bg-white/10 text-sky-200" : "bg-slate-900 text-white"}`}>
          {icon}
        </div>
      </div>
      <p className={`mt-3 max-w-xs text-sm leading-7 ${primary ? "text-white/72" : "text-slate-500"}`}>{caption}</p>
      {trend ? (
        <div className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] ${primary ? "bg-white/10 text-white/80" : "bg-slate-100 text-slate-600"}`}>
          {trend}
        </div>
      ) : null}
    </div>
  );
}
