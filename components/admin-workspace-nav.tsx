"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/curriculum", label: "Curriculum Catalog Manager" },
  { href: "/admin/activity", label: "Activity Review" },
  { href: "/admin/insights", label: "Analytics & Alerts" },
  { href: "/admin/access", label: "Access Control" }
];

export function AdminWorkspaceNav() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  const selectedHref = adminLinks.find((link) => isActive(link.href))?.href ?? "/admin";

  return (
    <div className="glass-panel rounded-[1.35rem] p-2.5 md:p-3">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Admin Modules</p>
          <p className="mt-1.5 text-base font-semibold tracking-[-0.02em] text-slate-800 md:text-lg">Structured administration workspace</p>
        </div>
        <div className="w-full lg:hidden">
          <select
            className="apple-input w-full px-3.5 py-2.5 text-sm font-medium"
            value={selectedHref}
            onChange={(event) => router.push(event.target.value)}
          >
            {adminLinks.map((link) => (
              <option key={link.href} value={link.href}>
                {link.label}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden gap-1.5 lg:grid lg:grid-cols-2 xl:flex xl:flex-wrap">
          {adminLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-[0.95rem] px-3 py-2.5 text-xs font-medium card-hover transition sm:text-sm ${
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
