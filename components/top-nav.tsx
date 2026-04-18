"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
    const links = [
      { href: "/", label: "Home" },
      { href: "/teacher", label: "Teacher" },
      { href: "/logs/new", label: "Daily Log" }
    ];

    if (authState.role === "admin") {
      links.push({ href: "/admin", label: "Admin" });
    }

    return links;
  }, [authState.role]);

  async function handleSignOut() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // Browser sign out fallback is cookie clear below.
    }

    await fetch("/api/auth/session", {
      method: "DELETE"
    });

    setAuthState({
      loading: false,
      authenticated: false,
      role: null,
      name: null
    });

    router.push("/signin");
    router.refresh();
  }

  return (
    <header className="top-nav-wrap px-4 pt-4 md:px-6 md:pt-6">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 rounded-[1.4rem] border border-slate-200/70 bg-white/80 px-4 py-3 shadow-soft backdrop-blur md:px-5">
        <div className="flex items-center gap-4">
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
      </div>
    </header>
  );
}
