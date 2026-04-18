"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const nextRoute = useMemo(() => {
    const nextValue = searchParams.get("next");
    if (!nextValue || !nextValue.startsWith("/")) {
      return "/admin";
    }

    return nextValue;
  }, [searchParams]);

  async function persistSession(accessToken: string, refreshToken: string) {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ accessToken, refreshToken })
    });

    if (!response.ok) {
      throw new Error("Failed to persist session cookie");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        throw error ?? new Error("Missing session");
      }

      await persistSession(data.session.access_token, data.session.refresh_token);
      router.push(nextRoute);
      router.refresh();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to authenticate";
      setMessage(text);
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">Secure Access</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-800">Sign in to EduTrack</h1>
      <p className="mt-3 text-sm leading-7 text-slate-500">
        Use your existing account to sign in. Admin access is role-gated through Supabase, and login works as often as you need.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="apple-input px-4 py-3 text-sm"
            placeholder="you@college.edu"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="apple-input px-4 py-3 text-sm"
            placeholder="Enter password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[1.1rem] bg-slate-800 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Sign in"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
