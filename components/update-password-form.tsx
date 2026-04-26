"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = getSupabaseBrowserClient();
      
      const { error: updateError } = await supabase.auth.updateUser({ password });
      
      if (updateError) {
        throw new Error(updateError.message);
      }

      setMessage("Password updated successfully. You can now login with your new password.");
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to update password";
      setMessage(text);
    }

    setLoading(false);
  }

  return (
    <div className="auth-card reveal-up mx-auto w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-soft backdrop-blur md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">Security</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-800">Set New Password</h1>
      <p className="mt-3 text-sm leading-7 text-slate-500">
        Please enter your new strong password below.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">New Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="apple-input px-4 py-3 text-sm"
            placeholder="Enter new password"
            minLength={6}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="premium-button w-full rounded-[1.1rem] bg-gradient-to-r from-slate-900 to-blue-800 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>

      {message ? (
        <p className={`mt-4 rounded-xl border px-3 py-2 text-sm ${message.includes("successfully") ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
