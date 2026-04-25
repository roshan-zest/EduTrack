"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const TAB_LOCAL_LOGOUT_KEY = "edutrack-tab-local-logout";

type AuthState = {
  loading: boolean;
  authenticated: boolean;
  role: "admin" | "teacher" | null;
  name: string | null;
};

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    loading: true,
    authenticated: false,
    role: null,
    name: null
  });

  useEffect(() => {
    let cancelled = false;

    async function loadAuth() {
      if (typeof window !== "undefined" && sessionStorage.getItem(TAB_LOCAL_LOGOUT_KEY) === "1") {
        if (!cancelled) {
          setAuthState({
            loading: false,
            authenticated: false,
            role: null,
            name: null
          });
        }
        return;
      }

      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const payload = (await response.json()) as {
          authenticated?: boolean;
          role?: "admin" | "teacher" | null;
          name?: string | null;
        };

        if (!cancelled) {
          setAuthState({
            loading: false,
            authenticated: Boolean(payload.authenticated),
            role: payload.role ?? null,
            name: payload.name ?? null
          });
        }
      } catch {
        if (!cancelled) {
          setAuthState({
            loading: false,
            authenticated: false,
            role: null,
            name: null
          });
        }
      }
    }

    loadAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const navLinks = useMemo(() => {
    const links = [{ href: "/", label: "Home" }];

    if (!authState.authenticated) {
      return links;
    }

    links.push({ href: "/teacher", label: "Teacher" }, { href: "/logs/new", label: "Daily Log" });

    return links;
  }, [authState.authenticated]);

  const activeHref =
    navLinks.find((item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))?.href ?? "/";

  async function handleSignOut() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(TAB_LOCAL_LOGOUT_KEY, "1");
    }

    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Keep tab-local logout state even if Supabase client sign out fails.
    }

    setAuthState({
      loading: false,
      authenticated: false,
      role: null,
      name: null
    });

    router.push("/signin");
    router.refresh();
  }

  if (pathname.startsWith("/signin")) {
    return null;
  }

  return (
    <header className="top-nav-wrap px-4 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-slate-200/70 bg-white/85 px-4 py-3 shadow-soft backdrop-blur md:px-5">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">SJR</span>
            <span className="text-lg font-semibold tracking-[-0.03em] text-slate-800">EduTrack</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    active ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {authState.authenticated ? (
            <>
              <Link
                href="/profile"
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  pathname.startsWith("/profile")
                    ? "border-slate-800 bg-slate-800 text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {authState.name ? `Profile · ${authState.name.split(" ")[0]}` : "Profile"}
              </Link>
              <button
                type="button"
                className="rounded-full bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/signin" className="rounded-full bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white">
              {authState.loading ? "Loading..." : "Sign In"}
            </Link>
          )}
        </div>

        <div className="w-full md:hidden">
          {navLinks.length > 1 ? (
          <select
            className="apple-input w-full px-4 py-2.5 text-sm"
            value={activeHref}
            onChange={(event) => router.push(event.target.value)}
          >
            {navLinks.map((item) => (
              <option key={item.href} value={item.href}>
                {item.label}
              </option>
            ))}
          </select>
          ) : null}
        </div>
      </div>
    </header>
  );
}
