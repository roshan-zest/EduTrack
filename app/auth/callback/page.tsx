"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      const supabase = getSupabaseBrowserClient();
      
      // 1. Check for PKCE Code in URL query params
      const code = searchParams.get("code");
      const next = searchParams.get("next") ?? "/update-password";

      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        
        if (data.session) {
          // Persist custom cookies
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              accessToken: data.session.access_token, 
              refreshToken: data.session.refresh_token 
            })
          });
          router.push(next);
          return;
        }
      }

      // 2. Check for Implicit Flow in URL hash (#access_token=...)
      // Supabase client automatically parses this and sets its own session if we wait a moment
      const hash = window.location.hash;
      if (hash && hash.includes("access_token=")) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (session) {
          // Persist custom cookies
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              accessToken: session.access_token, 
              refreshToken: session.refresh_token 
            })
          });
          router.push(next);
          return;
        }
      }

      // If we get here and there's no hash/code, maybe the session was already established
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push(next);
      } else {
        setError("Invalid or expired reset link. Please try again.");
      }
    }

    processCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <h2 className="text-xl font-semibold text-slate-800">Authenticating...</h2>
        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
            <div className="mt-4">
              <button 
                onClick={() => router.push("/signin")}
                className="text-red-900 underline hover:text-red-700"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Please wait while we securely log you in.</p>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
