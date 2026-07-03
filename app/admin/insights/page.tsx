import { AdminInsightsContent } from "@/components/admin-insights-content";
import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";
import { requireAdminPage } from "@/lib/auth";
import { getTeachingLogsData, getTeachersData } from "@/lib/data-access";

export default async function AdminInsightsPage() {
  const [, logResult, teachersResult] = await Promise.all([
    requireAdminPage(),
    getTeachingLogsData(),
    getTeachersData()
  ]);

  const teachingLogs = logResult.data;
  const teachers = teachersResult.data;

  return (
    <AppShell
      title="Analytics & Alerts"
      subtitle="Track workload, methodology spread, trend lines, and operational alerts in one dedicated analytics surface."
      role="Admin"
    >
      <AdminWorkspaceNav />

      <AdminInsightsContent teachingLogs={teachingLogs} teachers={teachers} />
    </AppShell>
  );
}
