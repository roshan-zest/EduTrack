'use client';

import Link from "next/link";

type StatCardProps = {
  label: string;
  value: string;
  caption: string;
  trend?: string;
  tone?: "primary" | "neutral" | "success" | "warning";
  icon?: string;
  href?: string;
};

const toneClass: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "kpi-card-primary",
  neutral: "kpi-card",
  success: "kpi-card border-emerald-200/70",
  warning: "kpi-card border-amber-200/70"
};

export function StatCard({ label, value, caption, trend, tone = "neutral", icon = "●", href }: StatCardProps) {
  const primary = tone === "primary";
  const contentClass = `${toneClass[tone]} rounded-[1.5rem] p-4 md:p-5 transition-colors hover:bg-white/95 ${href ? "cursor-pointer hover:shadow-lg hover:-translate-y-1" : ""}`;

  const content = (
    <div className={contentClass}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${primary ? "text-white/60" : "text-slate-400"}`}>
            {label}
          </p>
          <p className={`mt-2.5 text-3xl font-semibold tracking-[-0.04em] md:text-[2rem] ${primary ? "text-white" : "text-slate-800"}`}>
            {value}
          </p>
        </div>
        <div className={`rounded-[0.9rem] px-2.5 py-1.5 text-xs ${primary ? "bg-white/10 text-sky-200" : "bg-slate-900 text-white"}`}>
          {icon}
        </div>
      </div>
      <p className={`mt-2.5 max-w-xs text-sm leading-6 ${primary ? "text-white/72" : "text-slate-500"}`}>{caption}</p>
      {trend ? (
        <div className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${primary ? "bg-white/10 text-white/80" : "bg-slate-100 text-slate-600"}`}>
          {trend}
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
