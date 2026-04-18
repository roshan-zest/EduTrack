import { Suspense } from "react";
import Link from "next/link";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_0.95fr]">
        <section className="grid-surface rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-orange-500">FAIS Authentication</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-800 md:text-5xl">
            Role-protected academic workspace
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-8 text-slate-600 md:text-base">
            Teachers and admins can use the same sign-in flow. This page is for existing accounts, and admin routes remain locked unless your account has the admin role.
          </p>

          <div className="mt-7 space-y-3 text-sm text-slate-600">
            <p>1. Sign in with your existing account.</p>
            <p>2. Add your email to INITIAL_ADMIN_EMAIL in environment once for bootstrap admin access.</p>
            <p>3. Use Admin Access Control to grant admin role to other users.</p>
          </div>

          <Link href="/" className="mt-8 inline-flex rounded-[1rem] border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
            Back to home
          </Link>
        </section>

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
      </div>
    </main>
  );
}
