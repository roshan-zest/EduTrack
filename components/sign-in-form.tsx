"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TAB_LOCAL_LOGOUT_KEY = "edutrack-tab-local-logout";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"signin" | "signup" | "forgot-password">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const nextRoute = useMemo(() => {
    const nextValue = searchParams.get("next");
    if (!nextValue || !nextValue.startsWith("/")) {
      return "/teacher";
    }

    return nextValue;
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "forgot-password") {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail })
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error ?? "Unable to request password reset");
        }
        setMessage("Password reset link sent to your email.");
        setLoading(false);
        return;
      }

      if (mode === "signin") {
        const response = await fetch("/api/auth/direct-signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password })
        });

        const payload = (await response.json()) as {
          success?: boolean;
          authenticated?: boolean;
          accessStatus?: "pending" | "invalid";
          accessCode?: string | null;
          error?: string;
        };

        if (!response.ok || !payload.success || !payload.authenticated) {
          if (payload.accessStatus === "pending") {
            setMessage(
              payload.accessCode
                ? `Your registration is pending admin approval. Share code ${payload.accessCode} with admin.`
                : "Your registration is pending admin approval."
            );
          } else {
            setMessage(payload.error ?? "Unable to authenticate");
          }
          setLoading(false);
          return;
        }

        sessionStorage.removeItem(TAB_LOCAL_LOGOUT_KEY);
        router.push(nextRoute);
        router.refresh();
      } else {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email: normalizedEmail, password })
        });

        const payload = (await response.json()) as {
          success: boolean;
          data?: { access_code?: string; status?: string };
          error?: string;
        };

        if (!response.ok || !payload.success) {
          throw new Error(payload.error ?? "Unable to register right now");
        }

        const code = payload.data?.access_code ?? "";
        const status = payload.data?.status ?? "pending";
        setAccessCode(code);
        if (status === "approved") {
          setMessage(`Your account is already approved. Login with your email and password.`);
        } else {
          setMessage(`Registration submitted. Your access code is ${code}. Share this code with admin for approval, then login with email and password.`);
        }
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to authenticate";
      setMessage(text);
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="auth-card reveal-up reveal-delay-1 mx-auto w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-soft backdrop-blur md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">Secure Access</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-800">
        {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}
      </h1>
      <p className="mt-3 text-sm leading-7 text-slate-500">
        {mode === "signin"
          ? "Login to continue into your role-aware workspace."
          : mode === "signup"
          ? "Register with your academic email, then continue with secure role-based access."
          : "Enter your email to receive a password reset link."}
      </p>

      {mode !== "forgot-password" && (
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-[1rem] border border-slate-200 bg-slate-50 p-1.5">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setMessage("");
            }}
            className={`rounded-[0.8rem] px-3 py-2 text-sm font-semibold transition ${
              mode === "signin" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setMessage("");
            }}
            className={`rounded-[0.8rem] px-3 py-2 text-sm font-semibold transition ${
              mode === "signup" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Register
          </button>
        </div>
      )}

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

        {mode !== "forgot-password" && (
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
        )}

        {mode === "signin" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setMode("forgot-password");
                setMessage("");
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Forgot password?
            </button>
          </div>
        )}

        <p className="text-xs text-slate-500">
          {mode === "signin" 
            ? "Use your existing credentials." 
            : mode === "signup" 
            ? "Use a valid email and strong password."
            : "We'll send a secure reset link to your inbox."}
        </p>

        <button
          type="submit"
          disabled={loading}
          className="premium-button w-full rounded-[1.1rem] bg-gradient-to-r from-slate-900 to-blue-800 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading 
            ? "Please wait..." 
            : mode === "signin" 
            ? "Sign in to workspace" 
            : mode === "signup" 
            ? "Create account"
            : "Send reset link"}
        </button>

        {mode === "forgot-password" && (
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setMessage("");
            }}
            className="mt-2 w-full text-center text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Back to login
          </button>
        )}
      </form>

      {message ? <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{message}</p> : null}
      {accessCode ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          Access code: <span className="font-semibold tracking-[0.12em] text-slate-900">{accessCode}</span>
        </div>
      ) : null}
    </div>
  );
}
