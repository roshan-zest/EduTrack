import { AdminInsightsContent } from "@/components/admin-insights-content";
import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";
import { requireAdminPage } from "@/lib/auth";
import { getTeachingLogsData } from "@/lib/data-access";

export default async function AdminInsightsPage() {
  await requireAdminPage();

  const logResult = await getTeachingLogsData();
  const teachingLogs = logResult.data;

  return (
    <AppShell
      title="Analytics & Alerts"
      subtitle="Track workload, methodology spread, trend lines, and operational alerts in one dedicated analytics surface."
      role="Admin"
    >
      <AdminWorkspaceNav />

      <AdminInsightsContent teachingLogs={teachingLogs} />
    </AppShell>
  );
}
