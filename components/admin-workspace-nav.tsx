"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/curriculum", label: "Curriculum Catalog Manager" },
  { href: "/admin/activity", label: "Activity Review" },
  { href: "/admin/insights", label: "Analytics & Alerts" }
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
    <div className="glass-panel rounded-[1.6rem] p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Admin Modules</p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-800">Structured administration workspace</p>
        </div>
        <div className="w-full lg:hidden">
          <select
            className="apple-input w-full px-4 py-3 text-sm font-medium"
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

        <div className="hidden gap-2 lg:grid lg:grid-cols-2 xl:flex xl:flex-wrap">
          {adminLinks.map((link) => {
            const active = isActive(link.href);

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
