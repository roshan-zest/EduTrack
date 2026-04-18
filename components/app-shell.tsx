"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";

type AppShellProps = {
  title: string;
  subtitle: string;
  role: "Admin" | "Teacher";
  children: ReactNode;
};

export function AppShell({ title, subtitle, role, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [canViewAdminNav, setCanViewAdminNav] = useState(role === "Admin");

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const payload = (await response.json()) as {
          success?: boolean;
          role?: "admin" | "teacher" | null;
        };

        if (!cancelled && payload.success) {
          setCanViewAdminNav(payload.role === "admin");
        }
      } catch {
        if (!cancelled) {
          setCanViewAdminNav(role === "Admin");
        }
      }
    }

    loadRole();

    return () => {
      cancelled = true;
    };
  }, [role]);

  const navItems = useMemo(() => {
    const baseItems = [
      {
        href: "/",
        label: "Home",
        icon: "◫",
        isActive: pathname === "/"
      },
      {
        href: "/teacher",
        label: "Teacher Dashboard",
        icon: "◎",
        isActive: pathname.startsWith("/teacher")
      },
      {
        href: "/logs/new",
        label: "Submit Daily Log",
        icon: "✦",
        isActive: pathname.startsWith("/logs")
      }
    ];

    if (canViewAdminNav) {
      baseItems.push({
        href: "/admin",
        label: "Admin Dashboard",
        icon: "▣",
        isActive: pathname.startsWith("/admin")
      });
    }

    return baseItems;
  }, [canViewAdminNav, pathname]);

  const activeNavItem = navItems.find((item) => item.isActive) ?? navItems[0];

  return (
    <div className="fais-shell min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 xl:flex-row">
        <div className="glass-panel noise-overlay sticky top-3 z-20 rounded-[1.6rem] p-3 xl:hidden">
          <div className="flex items-center justify-between gap-4 px-3 py-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-orange-500">FAIS</p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-800">EduTrack</p>
            </div>
            <div className="rounded-[1rem] bg-slate-800 px-4 py-2 text-sm font-semibold text-white">{role}</div>
          </div>

          <div className="mt-3 grid gap-3">
            <label className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Quick Navigation</label>
            <select
              className="apple-input px-4 py-3.5 text-sm font-medium"
              value={activeNavItem.href}
              onChange={(event) => router.push(event.target.value)}
            >
              {navItems.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.label}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              {navItems
                .filter((item) => item.href !== activeNavItem.href)
                .slice(0, 2)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-[1rem] border border-white/60 bg-white/70 px-3 py-2.5 text-sm text-slate-700"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-slate-400">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        </div>

        <aside className="glass-panel noise-overlay hidden w-[268px] shrink-0 rounded-[2rem] p-5 lg:sticky lg:top-6 lg:flex lg:max-h-[calc(100vh-3rem)] lg:flex-col lg:self-start lg:overflow-y-auto xl:w-[292px] xl:p-6">
          <div className="grid-surface rounded-[1.75rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.38em] text-orange-500">FAIS</p>
            <h1 className="mt-4 text-[2.15rem] font-semibold tracking-[-0.04em] text-slate-800">EduTrack</h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Faculty Activity and Insights System with calmer dashboards and more structured academic operations.
            </p>
          </div>

          <nav className="mt-6 space-y-2 text-sm text-slate-700">
            {navItems.map((item) => {
              return (
              <Link
                key={item.href}
                className={`block rounded-[1.25rem] px-4 py-3.5 card-hover ${
                  item.isActive
                    ? "bg-slate-800 text-white soft-ring"
                    : "border border-white/50 bg-white/40 text-slate-600 hover:bg-white/80"
                }`}
                href={item.href}
              >
                <span className="flex items-center gap-3">
                  <span className={`text-sm ${item.isActive ? "text-sky-200" : "text-slate-400"}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
              </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[1.75rem] bg-gradient-to-br from-emerald-100 via-white to-sky-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-700">Signed In As</p>
            <p className="mt-4 text-[1.75rem] font-semibold tracking-[-0.03em] text-slate-800">{role}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              API-backed prototype with a Supabase-ready server layer and local development fallback.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
              <span className="status-dot bg-emerald-500" />
              Live workspace
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="glass-panel rounded-[2.25rem] p-4 md:p-6">
            <div className="glass-panel-strong noise-overlay flex flex-col gap-5 rounded-[1.85rem] px-5 py-5 md:px-7 md:py-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.34em] text-orange-500">{role} Workspace</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-800 md:text-4xl 2xl:text-5xl">{title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">{subtitle}</p>
                </div>

                <div className="glass-panel w-full rounded-[1.5rem] px-5 py-4 md:w-auto xl:min-w-[280px]">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">System Status</p>
                  <p className="mt-2 text-base font-medium tracking-[-0.02em] text-slate-700">Premium dashboard refresh and database-ready workflow</p>
                  <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                    <span className="status-dot bg-sky-500" />
                    Design system active
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
