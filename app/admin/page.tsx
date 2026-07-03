import { AdminDashboardContent } from "@/components/admin-dashboard-content";
import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";
import { requireAdminPage } from "@/lib/auth";
import { getTeachingLogsData, getTeachersData } from "@/lib/data-access";

export default async function AdminDashboardPage() {
  const [, logResult, teachersResult] = await Promise.all([
    requireAdminPage(),
    getTeachingLogsData(),
    getTeachersData()
  ]);

  const teachingLogs = logResult.data;
  const teachers = teachersResult.data;

  return (
    <AppShell
      title="Administrative Dashboard"
      subtitle="Manage faculty, requests, curriculum, and activity analytics in organized sections."
      role="Admin"
    >
      <AdminWorkspaceNav />

      <AdminDashboardContent teachingLogs={teachingLogs} teachers={teachers} />
    </AppShell>
  );
}
