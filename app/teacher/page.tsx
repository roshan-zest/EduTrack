import { AppShell } from "@/components/app-shell";
import { InsightChip } from "@/components/insight-chip";
import { LogTable } from "@/components/log-table";
import { StatCard } from "@/components/stat-card";
import { performanceInsights, teachers, teachingLogs } from "@/lib/mock-data";

export default function TeacherDashboardPage() {
  const teacher = teachers.find((entry) => entry.id === "t1");
  const metrics = performanceInsights.find((entry) => entry.teacherId === "t1");
  const personalLogs = teachingLogs.filter((entry) => entry.teacherId === "t1");

  if (!teacher || !metrics) {
    return null;
  }

  return (
    <AppShell
      title={`Welcome back, ${teacher.name}`}
      subtitle="Review your recent classes, teaching quality indicators, and submission consistency from one place."
      role="Teacher"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Department" value={teacher.department} caption="Your current academic unit" />
        <StatCard label="Classes Logged" value={String(metrics.totalClasses)} caption="Total teaching sessions captured this cycle" />
        <StatCard label="Hours Taught" value={`${metrics.totalHours} hrs`} caption="Tracked instructional time for this period" />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <InsightChip label="Consistency" value={metrics.consistencyScore} />
        <InsightChip label="Time Discipline" value={metrics.timeScore} />
        <InsightChip label="Method Diversity" value={metrics.diversityScore} />
        <InsightChip label="Workload" value={metrics.workloadScore} />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slateBlue">Recent Teaching Logs</h3>
          <p className="text-sm text-slate-500">Editable log history ready for API-backed persistence</p>
        </div>
        <LogTable logs={personalLogs} />
      </section>
    </AppShell>
  );
}
