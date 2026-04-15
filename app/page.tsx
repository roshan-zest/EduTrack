import Link from "next/link";

const roleCards = [
  {
    title: "Teacher Access",
    href: "/teacher",
    description: "Log daily academic activity, review workload, and monitor your teaching consistency."
  },
  {
    title: "Admin Access",
    href: "/admin",
    description: "Track institution-wide faculty activity, surface alerts, and review measurable insights."
  }
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid-surface rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-soft backdrop-blur md:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-clay">Faculty Activity & Insights System</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-slateBlue md:text-6xl">
              Structured teaching intelligence for better academic decisions.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
              This FAIS starter turns the design document into a responsive EduTrack prototype with teacher logging, admin analytics, alert surfacing, and dashboard-led workflows.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-2xl bg-slateBlue px-5 py-3 text-sm font-semibold text-white" href="/teacher">
                Explore Teacher Module
              </Link>
              <Link className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slateBlue" href="/admin">
                Explore Admin Module
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-clay">Core Objectives</p>
            <div className="mt-6 space-y-4">
              {[
                "Secure role-based access for teachers and admins",
                "Daily faculty activity capture with consistent structure",
                "Analytics and alerts for transparent monitoring",
                "Dashboard-first UI for fast decision-making"
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {roleCards.map((card) => (
            <Link key={card.title} href={card.href} className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-soft transition hover:-translate-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-clay">{card.title}</p>
              <h2 className="mt-3 text-2xl font-semibold text-slateBlue">{card.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
