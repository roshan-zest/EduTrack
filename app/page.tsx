import Link from "next/link";

export default function HomePage() {
  return (
    <main className="px-4 pb-10 pt-6 md:px-8 md:pt-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-soft md:p-12">
            <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-gradient-to-br from-sky-200/60 via-transparent to-emerald-200/20 blur-2xl" />
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-500">Faculty Activity & Insights System</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-slate-900 md:text-6xl">
              A smarter academic operating layer for teaching visibility and accountability.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">
              EduTrack combines secure role access, structured daily logging, curriculum governance, and operational analytics into one coherent platform built for institutions that care about measurable teaching quality.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white" href="/teacher">
                Enter Teacher Workspace
              </Link>
              <Link className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800" href="/admin">
                Enter Admin Workspace
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.6rem] border border-slate-200 bg-white/90 p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Security</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-800">Role-gated admin access</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Only verified admin-role users can access admin panel routes and write APIs.</p>
            </div>
            <div className="rounded-[1.6rem] border border-slate-200 bg-white/90 p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Control</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-800">Live curriculum governance</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Admins can manage programs, semesters, sections, and subjects without touching code.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Modules", value: "6+", note: "Focused teacher/admin workspaces" },
            { label: "Workflows", value: "Realtime", note: "API-backed with Supabase integration" },
            { label: "Access", value: "RBAC", note: "Admin role assignment built-in" }
          ].map((stat) => (
            <div key={stat.label} className="rounded-[1.6rem] border border-slate-200 bg-white/80 p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-600">{stat.note}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Link href="/teacher" className="rounded-[1.9rem] border border-slate-200 bg-white/90 p-8 shadow-soft transition hover:-translate-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">For Faculty</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900">Teacher Workspace</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Submit daily logs, monitor consistency, and track workload metrics from a clean timeline-oriented dashboard.</p>
            <p className="mt-5 text-sm font-semibold text-slate-800">Open teacher module →</p>
          </Link>

          <Link href="/admin" className="rounded-[1.9rem] border border-slate-200 bg-white/90 p-8 shadow-soft transition hover:-translate-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">For Leadership</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900">Admin Workspace</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Manage curriculum, review activity feeds, monitor insights, and control who can access privileged admin routes.</p>
            <p className="mt-5 text-sm font-semibold text-slate-800">Open admin module →</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
