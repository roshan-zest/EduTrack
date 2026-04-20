import { AdminAccessRequestManager } from "@/components/admin-access-request-manager";
import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";
import { requireAdminPage } from "@/lib/auth";

export default async function AdminAccessPage() {
  await requireAdminPage();

  return (
    <AppShell
      title="Admin Access Control"
      subtitle="Review registration requests, search by code or email, and approve who may enter the system."
      role="Admin"
    >
      <AdminWorkspaceNav />

      <section className="mt-8">
        <AdminAccessRequestManager />
      </section>
    </AppShell>
  );
}
