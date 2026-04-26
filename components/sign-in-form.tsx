"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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

  function isUserAlreadyRegisteredError(message: string) {
    return /already registered|already been registered|user already exists/i.test(message);
  }

  function isEmailRateLimitError(message: string) {
    return /rate limit|email rate limit exceeded|too many requests/i.test(message);
  }

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

  async function requestAccess(emailValue: string, passwordValue?: string) {
    const response = await fetch("/api/auth/request-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: emailValue, password: passwordValue })
    });

    const payload = (await response.json()) as {
      success: boolean;
      data?: { access_code?: string; status?: string };
      error?: string;
    };

    if (!response.ok || !payload.success || !payload.data?.access_code) {
      throw new Error(payload.error ?? "Unable to create access request");
    }

    return payload.data.access_code;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const supabase = getSupabaseBrowserClient();

      if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${window.location.origin}/auth/callback?next=/update-password`
        });
        if (error) {
          throw new Error(error.message);
        }
        setMessage("Password reset link sent to your email.");
        setLoading(false);
        return;
      }

      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error || !data.session) {
          const statusResponse = await fetch("/api/auth/access-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: normalizedEmail })
          });

          const statusPayload = (await statusResponse.json()) as {
            data?: { status?: string; accessCode?: string };
            error?: string;
          };

          if (statusPayload.data?.status === "pending") {
            setMessage("Your request is still pending. Wait for admin approval, then sign in using the access code you received.");
          } else if (statusPayload.data?.status === "approved" && statusPayload.data?.accessCode) {
            setMessage("Your request is approved. Sign in with your registered password.");
          } else if (statusPayload.data?.status === "not_found") {
            setMessage("No registration request found for this email. Use Register first, then wait for admin approval.");
          } else {
            setMessage(error?.message ?? "Unable to authenticate");
          }

          setLoading(false);
          return;
        }

        await persistSession(data.session.access_token, data.session.refresh_token);
        const authResponse = await fetch("/api/auth/me", { cache: "no-store" });
        const authPayload = (await authResponse.json()) as { authenticated?: boolean; accessStatus?: string };

        if (!authResponse.ok || !authPayload.authenticated) {
          await fetch("/api/auth/session", { method: "DELETE" });
          try {
            await supabase.auth.signOut();
          } catch {
            // ignore browser sign-out errors
          }

          const pendingMessage =
            authPayload.accessStatus === "pending"
              ? "Your registration is waiting for admin approval. Once approved, you can sign in normally."
              : "Access is blocked until an admin approves your registration request.";
          setMessage(pendingMessage);
          setLoading(false);
          return;
        }

        sessionStorage.removeItem(TAB_LOCAL_LOGOUT_KEY);
        router.push(nextRoute);
        router.refresh();
      } else {
        // mode === "signup"
        const signUpResult = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              raw_password: password
            }
          }
        });

        if (
          signUpResult.error &&
          !isUserAlreadyRegisteredError(signUpResult.error.message) &&
          !isEmailRateLimitError(signUpResult.error.message)
        ) {
          throw new Error(signUpResult.error.message);
        }

        if (signUpResult.data.session) {
          await supabase.auth.signOut();
        }

        const code = await requestAccess(normalizedEmail, password);
        setAccessCode(code);
        setMessage(
          signUpResult.error
            ? isEmailRateLimitError(signUpResult.error.message)
              ? `Registration request submitted. Your access code is ${code}. Email signup is rate-limited right now, so ask admin to approve first, then sign in using the access code.`
              : `Registration request refreshed. Your access code is ${code}. Wait for admin approval, then sign in with your existing password or access code.`
            : `Account created and registration request submitted. Your access code is ${code}. Wait for admin approval, then sign in with your password.`
        );
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
