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
      className={`glass-panel-strong card-hover rounded-[1.5rem] bg-gradient-to-br p-4 md:p-5 transition-transform transition-colors hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(15,23,42,0.10)] ${
        active ? "border-slate-800 ring-2 ring-slate-800/20" : "border-transparent"
      } ${accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
        <div
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            active ? "bg-slate-800 text-white" : "bg-white/75 text-slate-500"
          }`}
        >
          {active ? "Active" : "Open"}
        </div>
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-800 md:text-[1.35rem]">{title}</h3>
      <p className="mt-2.5 text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
        Enter module
        <span className="text-slate-400">→</span>
      </div>
    </Link>
  );
}
