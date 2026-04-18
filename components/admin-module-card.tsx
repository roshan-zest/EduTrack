"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminModuleCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  accent?: string;
};

export function AdminModuleCard({
  eyebrow,
  title,
  description,
  href,
  accent = "from-sky-500/20 to-indigo-500/10"
}: AdminModuleCardProps) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`glass-panel-strong card-hover rounded-[1.9rem] bg-gradient-to-br p-6 ${
        active ? "border-slate-800 ring-2 ring-slate-800/20" : "border-transparent"
      } ${accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{eyebrow}</p>
        <div
          className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${
            active ? "bg-slate-800 text-white" : "bg-white/75 text-slate-500"
          }`}
        >
          {active ? "Active" : "Open"}
        </div>
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-800">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-800">
        Enter module
        <span className="text-slate-400">→</span>
      </div>
    </Link>
  );
}
