import { Suspense } from "react";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <main className="auth-screen px-4 py-6 md:px-8 md:py-10">
      <div className="auth-bg" aria-hidden>
        <div className="auth-bg-grid" />
        <div className="auth-orb auth-orb-a" />
        <div className="auth-orb auth-orb-b" />
      </div>

      <div className="auth-overlay" />

      <section className="auth-stage">
        <Suspense
          fallback={
            <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-soft backdrop-blur md:p-10">
              <div className="h-6 w-40 rounded-full bg-slate-200/80" />
              <div className="mt-6 h-10 w-full rounded-[1rem] bg-slate-100" />
              <div className="mt-4 h-10 w-full rounded-[1rem] bg-slate-100" />
              <div className="mt-6 h-12 w-full rounded-[1rem] bg-slate-200/80" />
            </div>
          }
        >
          <SignInForm />
        </Suspense>
      </section>
    </main>
  );
}
