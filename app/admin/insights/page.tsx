import { AlertList } from "@/components/alert-list";
import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";
import { ActivityTrendChart, MethodologyChart, WorkloadChart } from "@/components/charts";
import { StatCard } from "@/components/stat-card";
import { requireAdminPage } from "@/lib/auth";
import { buildTeacherHours, durationHours } from "@/lib/admin-metrics";
import { getTeachingLogsData } from "@/lib/data-access";
import { activityTrend, alerts, methodologyDistribution } from "@/lib/mock-data";

export default async function AdminInsightsPage() {
  await requireAdminPage();

  const logResult = await getTeachingLogsData();
  const totalHours = logResult.data.reduce((sum, entry) => sum + durationHours(entry.startTime, entry.endTime), 0);
  const chartData = buildTeacherHours(logResult.data);

  return (
    <AppShell
      title="Analytics & Alerts"
      subtitle="Track workload, methodology spread, trend lines, and operational alerts in one dedicated analytics surface."
      role="Admin"
    >
      <AdminWorkspaceNav />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        <StatCard label="Hours Tracked" value={`${totalHours.toFixed(1)} hrs`} caption="Calculated from teaching logs in the current feed" tone="primary" icon="↗" trend="Live metric" />
        <StatCard label="Teachers In Charts" value={String(chartData.length)} caption="Faculty members represented in workload analytics" tone="neutral" icon="◎" trend="Coverage map" />
        <StatCard label="Active Alerts" value={String(alerts.length)} caption="System-generated warnings requiring admin attention" tone="warning" icon="!" trend="Needs review" />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <WorkloadChart data={chartData} />
        <MethodologyChart data={methodologyDistribution} />
        <ActivityTrendChart data={activityTrend} />
      </section>

      <section className="mt-8">
        <h3 className="mb-4 text-2xl font-semibold tracking-[-0.04em] text-slate-800">Attention Alerts</h3>
        <AlertList alerts={alerts} />
      </section>
    </AppShell>
  );
}
