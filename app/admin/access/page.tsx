import { AdminRoleManager } from "@/components/admin-role-manager";
import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";
import { requireAdminPage } from "@/lib/auth";

export default async function AdminAccessPage() {
  await requireAdminPage();

  return (
    <AppShell
      title="Admin Access Control"
      subtitle="Manage who can enter the admin panel by assigning or revoking the admin role."
      role="Admin"
    >
      <AdminWorkspaceNav />

      <section className="mt-8">
        <AdminRoleManager />
      </section>
    </AppShell>
  );
}
