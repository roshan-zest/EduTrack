import { AdminDashboardContent } from "@/components/admin-dashboard-content";
import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";
import { requireAdminPage } from "@/lib/auth";
import { getTeachingLogsData } from "@/lib/data-access";

export default async function AdminDashboardPage() {
  await requireAdminPage();

  const logResult = await getTeachingLogsData();
  const teachingLogs = logResult.data;

  return (
    <AppShell
      title="Administrative Dashboard"
      subtitle="Manage faculty, requests, curriculum, and activity analytics in organized sections."
      role="Admin"
    >
      <AdminWorkspaceNav />

      <AdminDashboardContent teachingLogs={teachingLogs} />
    </AppShell>
  );
}
