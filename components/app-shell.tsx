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
    <div className="fais-shell min-h-screen px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5">
      <div className="mx-auto flex max-w-[1520px] flex-col gap-4 lg:flex-row">
        <div className="glass-panel noise-overlay sticky top-2 z-20 rounded-[1.35rem] p-2.5 lg:hidden">
          <div className="flex items-center justify-between gap-3 px-2.5 py-1.5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-500">FAIS</p>
              <p className="mt-0.5 text-xl font-semibold tracking-[-0.03em] text-slate-800">EduTrack</p>
            </div>
            <div className="rounded-[0.85rem] bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white">{role}</div>
          </div>

          <div className="mt-2.5 grid gap-2.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Quick Navigation</label>
            <select
              className="apple-input px-3.5 py-2.5 text-sm font-medium"
              value={activeNavItem.href}
              onChange={(event) => router.push(event.target.value)}
            >
              {navItems.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.label}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-1.5">
              {navItems
                .filter((item) => item.href !== activeNavItem.href)
                .slice(0, 2)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-[0.85rem] border border-white/60 bg-white/70 px-2.5 py-2 text-xs text-slate-700"
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

        <aside className="glass-panel noise-overlay hidden w-[244px] shrink-0 rounded-[1.75rem] p-4 lg:sticky lg:top-4 lg:flex lg:max-h-[calc(100vh-2.5rem)] lg:flex-col lg:self-start lg:overflow-y-auto xl:w-[270px] xl:p-5">
          <div className="grid-surface rounded-[1.5rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-orange-500">FAIS</p>
            <h1 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.03em] text-slate-800">EduTrack</h1>
            <p className="mt-2.5 text-sm leading-6 text-slate-500">
              Faculty Activity and Insights System with calmer dashboards and more structured academic operations.
            </p>
          </div>

          <nav className="mt-5 space-y-1.5 text-sm text-slate-700">
            {navItems.map((item) => {
              return (
              <Link
                key={item.href}
                className={`block rounded-[1rem] px-3.5 py-2.5 card-hover ${
                  item.isActive
                    ? "bg-slate-800 text-white soft-ring"
                    : "border border-white/50 bg-white/40 text-slate-600 hover:bg-white/80"
                }`}
                href={item.href}
              >
                <span className="flex items-center gap-2.5">
                  <span className={`text-xs ${item.isActive ? "text-sky-200" : "text-slate-400"}`}>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </span>
              </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[1.5rem] bg-gradient-to-br from-emerald-100 via-white to-sky-100 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-700">Signed In As</p>
            <p className="mt-3 text-[1.45rem] font-semibold tracking-[-0.03em] text-slate-800">{role}</p>
            <p className="mt-2 text-xs leading-6 text-slate-600">
              API-backed prototype with a Supabase-ready server layer and local development fallback.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-slate-500">
              <span className="status-dot bg-emerald-500" />
              Live workspace
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="glass-panel rounded-[1.8rem] p-3.5 md:p-4.5 lg:p-5">
            <div className="glass-panel-strong noise-overlay flex flex-col gap-4 rounded-[1.45rem] px-4 py-4 md:px-5 md:py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-500">{role} Workspace</p>
                  <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-slate-800 md:text-[2rem] xl:text-[2.35rem]">{title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-[15px]">{subtitle}</p>
                </div>

                <div className="glass-panel hidden w-full rounded-[1.2rem] px-4 py-3 md:block md:w-auto xl:min-w-[245px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">System Status</p>
                  <p className="mt-1.5 text-sm font-medium tracking-[-0.01em] text-slate-700">Dashboard and API sync ready</p>
                  <div className="mt-2.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    <span className="status-dot bg-sky-500" />
                    Design system active
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-5">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
