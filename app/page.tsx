import Link from "next/link";

const corePrinciples = [
  {
    title: "Fast daily logging",
    detail: "Teachers submit structured class updates in minutes with cleaner forms and less friction."
  },
  {
    title: "Calm insights",
    detail: "Academic teams get clarity on consistency and delivery without noisy dashboards."
  },
  {
    title: "Secure by design",
    detail: "Role checks are enforced server-side, so access control stays trustworthy and predictable."
  }
] as const;

const processSteps = [
  {
    number: "01",
    title: "Authenticate",
    detail: "Login or register through one focused auth flow."
  },
  {
    number: "02",
    title: "Log activity",
    detail: "Submit teaching sessions with topic, method, and timing."
  },
  {
    number: "03",
    title: "Review outcomes",
    detail: "Track progress and take action from one connected workspace."
  }
] as const;

export default function HomePage() {
  return (
    <main className="landing-wrap px-4 pb-0 pt-6 md:px-8 md:pt-10">
      <div className="mx-auto max-w-6xl space-y-12 md:space-y-16">
        <section className="reveal-up relative overflow-hidden rounded-[2.2rem] border border-slate-200/70 bg-white/88 p-7 shadow-soft backdrop-blur md:p-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-sky-300/50 via-cyan-200/25 to-emerald-200/30 blur-3xl" />

          <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
            <span className="status-dot bg-sky-500" />
            EduTrack Platform
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.05em] text-slate-900 md:text-6xl">
            Academic operations, simplified.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-600 md:text-base">
            A cleaner workflow for teacher logs, accountability, and institutional visibility. Less clutter, more signal.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signin" className="premium-button inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white">
              Login or Register
              <span aria-hidden>→</span>
            </Link>
            <Link href="#how-it-works" className="premium-button rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700">
              How it works
            </Link>
          </div>
        </section>

        <section className="reveal-up reveal-delay-1 grid gap-4 md:grid-cols-3">
          {corePrinciples.map((item) => (
            <article key={item.title} className="rounded-[1.4rem] border border-slate-200/80 bg-white/82 p-6 shadow-soft">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
            </article>
          ))}
        </section>

        <section id="how-it-works" className="reveal-up reveal-delay-2 rounded-[1.9rem] border border-slate-200/80 bg-white/90 p-6 shadow-soft md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Workflow</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-900 md:text-4xl">How the platform works</h3>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {processSteps.map((step) => (
              <div key={step.number} className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 px-4 py-4">
                <p className="text-xs font-semibold tracking-[0.24em] text-sky-700">STEP {step.number}</p>
                <h4 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-slate-900">{step.title}</h4>
                <p className="mt-1 text-sm leading-7 text-slate-600">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-12 border-t border-slate-200/80 bg-white/70 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em] text-slate-900">EduTrack</p>
            <p className="mt-1 text-sm text-slate-600">Faculty Activity and Insights System.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/">Home</Link>
            <Link href="/signin">Authentication</Link>
            <Link href="/teacher">Teacher</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}