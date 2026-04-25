import { AppShell } from "@/components/app-shell";
import { InsightChip } from "@/components/insight-chip";
import { LogTable } from "@/components/log-table";
import { StatCard } from "@/components/stat-card";
import { requireAuthPage } from "@/lib/auth";
import { durationHours, buildTeacherHours, buildMethodologyDistribution } from "@/lib/admin-metrics";
import { getTeacherDirectoryData, getTeachingLogsData } from "@/lib/data-access";

export default async function TeacherDashboardPage() {
  const auth = await requireAuthPage("/teacher");
  const directoryResult = await getTeacherDirectoryData();
  const logResult = await getTeachingLogsData();
  const isAdmin = auth.role === "admin";

  const teacher =
    directoryResult.data.find((entry) => entry.email.toLowerCase() === auth.user.email.toLowerCase()) ??
    directoryResult.data.find((entry) => entry.name.toLowerCase() === auth.user.name.toLowerCase()) ??
    {
      id: auth.user.id,
      name: auth.user.name,
      email: auth.user.email,
      department: auth.user.department ?? "Teaching Staff",
      role: "teacher" as const
    };

  const visibleLogs = isAdmin
    ? logResult.data
    : logResult.data.filter((entry) => {
        return (
          entry.teacherId === teacher.id ||
          entry.teacherName.toLowerCase() === teacher.name.toLowerCase() ||
          entry.teacherName.toLowerCase() === auth.user.name.toLowerCase()
        );
      });

  const metrics = {
    totalClasses: visibleLogs.length,
    totalHours: Number(visibleLogs.reduce((sum, entry) => sum + durationHours(entry.startTime, entry.endTime), 0).toFixed(1)),
    consistencyScore: Math.min(100, 70 + visibleLogs.length * 4),
    timeScore: Math.min(100, 72 + visibleLogs.length * 3),
    diversityScore: Math.min(100, 68 + buildMethodologyDistribution(visibleLogs).length * 5),
    workloadScore: Math.min(100, 70 + buildTeacherHours(visibleLogs).length * 2)
  };

  return (
    <AppShell
      title={isAdmin ? "Teacher Dashboard (Admin View)" : `Welcome back, ${teacher.name}`}
      subtitle={
        isAdmin
          ? "Admin view shows all submitted teaching logs and aggregate indicators."
          : "Review your recent classes, teaching quality indicators, and submission consistency from one place."
      }
      role={isAdmin ? "Admin" : "Teacher"}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Department"
          value={isAdmin ? "All Departments" : teacher.department}
          caption={isAdmin ? "Administrative aggregate scope" : "Your current academic unit"}
          tone="primary"
          icon="◎"
          trend={isAdmin ? "Global view" : "Assigned faculty"}
        />
        <StatCard label="Classes Logged" value={String(metrics.totalClasses)} caption="Total teaching sessions captured this cycle" tone="neutral" icon="▣" trend="Up this term" />
        <StatCard label="Hours Taught" value={`${metrics.totalHours} hrs`} caption="Tracked instructional time for this period" tone="success" icon="↗" trend="On schedule" />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightChip label="Consistency" value={metrics.consistencyScore} />
        <InsightChip label="Time Discipline" value={metrics.timeScore} />
        <InsightChip label="Method Diversity" value={metrics.diversityScore} />
        <InsightChip label="Workload" value={metrics.workloadScore} />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-800">Recent Teaching Logs</h3>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              {isAdmin
                ? "Administrative timeline of all submitted teaching logs."
                : "A cleaner timeline of your latest classes, topics, and delivery methods."}
            </p>
          </div>
          <div className="glass-panel rounded-[1.2rem] px-4 py-3 text-sm text-slate-600">{isAdmin ? "All teachers stream" : "Teacher activity stream"}</div>
        </div>
        <LogTable logs={visibleLogs} />
      </section>
    </AppShell>
  );
}
