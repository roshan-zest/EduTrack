import Link from "next/link";
import { AdminModuleCard } from "@/components/admin-module-card";
import { LogTable } from "@/components/log-table";
import { StatCard } from "@/components/stat-card";
import { durationHours } from "@/lib/admin-metrics";
import { getAuthContextFromCookies, type AuthContext } from "@/lib/auth";
import { getTeachingLogsData } from "@/lib/data-access";

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

const teacherActions = [
  {
    eyebrow: "Daily Log",
    title: "Log Today's Classes",
    description: "Submit your full day of teaching sessions — subjects, topics, timing, and methodology — in one table.",
    href: "/logs/new",
    accent: "from-sky-500/18 via-white to-indigo-500/8"
  },
  {
    eyebrow: "Overview",
    title: "My Dashboard",
    description: "Review your teaching stats, quality indicators, and recent session history at a glance.",
    href: "/teacher",
    accent: "from-blue-500/12 via-white to-cyan-500/8"
  },
  {
    eyebrow: "Account",
    title: "My Profile",
    description: "Update your name, department, designation, and account details.",
    href: "/profile",
    accent: "from-emerald-500/14 via-white to-sky-500/8"
  }
] as const;

const adminActions = [
  {
    eyebrow: "Control Center",
    title: "Admin Dashboard",
    description: "Faculty analytics, workload charts, and system management modules in one workspace.",
    href: "/admin",
    accent: "from-blue-500/12 via-white to-cyan-500/8"
  },
  {
    eyebrow: "Faculty",
    title: "Teacher Directory",
    description: "Browse all faculty, view teaching sessions, track hours, and monitor per-teacher activity.",
    href: "/admin/teachers",
    accent: "from-sky-500/18 via-white to-indigo-500/8"
  },
  {
    eyebrow: "Requests",
    title: "Registration Requests",
    description: "Review pending teacher registrations and approve or reject access in one place.",
    href: "/admin/access",
    accent: "from-amber-500/14 via-white to-orange-500/10"
  }
] as const;

async function SignedInHome({ auth }: { auth: AuthContext }) {
  const logResult = await getTeachingLogsData();
  const logs =
    auth.role === "admin"
      ? logResult.data
      : logResult.data.filter(
          (entry) =>
            entry.teacherId === auth.user.id ||
            entry.teacherName.toLowerCase() === auth.user.name.toLowerCase()
        );

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekLogs = logs.filter((entry) => {
    const entryDate = new Date(entry.date);
    return !Number.isNaN(entryDate.getTime()) && entryDate >= weekAgo;
  });
  const weekHours = Number(
    weekLogs.reduce((sum, entry) => sum + durationHours(entry.startTime, entry.endTime), 0).toFixed(1)
  );

  const isAdmin = auth.role === "admin";
  const firstName = auth.user.name.split(" ")[0] || auth.user.name;
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const actions = isAdmin ? adminActions : teacherActions;
  const recentLogs = logs.slice(0, 5);

  return (
    <main className="landing-wrap px-4 pb-10 pt-6 md:px-8 md:pt-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="reveal-up relative overflow-hidden rounded-[2.2rem] border border-slate-200/70 bg-white/88 p-7 shadow-soft backdrop-blur md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-sky-300/50 via-cyan-200/25 to-emerald-200/30 blur-3xl" />

          <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
            <span className="status-dot bg-sky-500" />
            {isAdmin ? "Admin Workspace" : "Teacher Workspace"}
          </p>

          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.05em] text-slate-900 md:text-5xl">
            Welcome back, {firstName}.
          </h1>

          <p className="mt-3 text-sm leading-8 text-slate-600 md:text-base">
            {today}
            {auth.user.department ? ` · ${auth.user.department}` : ""}
            {isAdmin
              ? " — here's what's happening across your faculty."
              : " — pick up where you left off."}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={isAdmin ? "/admin" : "/logs/new"}
              className="premium-button inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
            >
              {isAdmin ? "Open Admin Dashboard" : "Log Today's Classes"}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href={isAdmin ? "/admin/insights" : "/teacher"}
              className="premium-button rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700"
            >
              {isAdmin ? "View Insights" : "My Dashboard"}
            </Link>
          </div>
        </section>

        <section className="reveal-up reveal-delay-1 grid gap-4 md:grid-cols-3">
          <StatCard
            label={isAdmin ? "Classes This Week" : "My Classes This Week"}
            value={String(weekLogs.length)}
            caption="Teaching sessions logged in the last 7 days"
            tone="primary"
            icon="▣"
            trend="Rolling week"
          />
          <StatCard
            label={isAdmin ? "Hours This Week" : "My Hours This Week"}
            value={`${weekHours} hrs`}
            caption="Instructional time tracked in the last 7 days"
            tone="success"
            icon="↗"
            trend="Rolling week"
          />
          {isAdmin ? (
            <StatCard
              label="Active Teachers"
              value={String(new Set(weekLogs.map((entry) => entry.teacherId)).size)}
              caption="Faculty who logged classes in the last 7 days"
              tone="neutral"
              icon="◉"
              trend="This week"
              href="/admin/teachers"
            />
          ) : (
            <StatCard
              label="Total Classes Logged"
              value={String(logs.length)}
              caption="All teaching sessions on your record"
              tone="neutral"
              icon="◎"
              trend="All time"
              href="/teacher"
            />
          )}
        </section>

        <section className="reveal-up reveal-delay-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Quick Actions</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => (
              <AdminModuleCard key={action.href} {...action} />
            ))}
          </div>
        </section>

        {recentLogs.length > 0 ? (
          <section className="reveal-up reveal-delay-2">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Recent Activity</p>
                <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-slate-900">
                  {isAdmin ? "Latest Faculty Logs" : "Your Latest Classes"}
                </h2>
              </div>
              <Link
                href={isAdmin ? "/admin/activity" : "/teacher"}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                View all →
              </Link>
            </div>
            <LogTable logs={recentLogs} />
          </section>
        ) : null}
      </div>
    </main>
  );
}

function MarketingHome() {
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

export default async function HomePage() {
  const auth = await getAuthContextFromCookies();

  if (auth) {
    return <SignedInHome auth={auth} />;
  }

  return <MarketingHome />;
}
