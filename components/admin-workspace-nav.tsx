"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/curriculum", label: "Curriculum Catalog Manager" },
  { href: "/admin/activity", label: "Activity Review" },
  { href: "/admin/insights", label: "Analytics & Alerts" }
];

export function AdminWorkspaceNav() {
  const pathname = usePathname();

  return (
    <div className="glass-panel rounded-[1.6rem] p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Admin Modules</p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-800">Structured administration workspace</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap">
          {adminLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-[1.1rem] px-4 py-3 text-sm font-medium card-hover transition ${
                  active
                    ? "bg-slate-800 text-white soft-ring"
                    : "border border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
