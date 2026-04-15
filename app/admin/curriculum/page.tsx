import { AdminCurriculumManager } from "@/components/admin-curriculum-manager";
import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";

export default function AdminCurriculumPage() {
  return (
    <AppShell
      title="Curriculum Catalog Manager"
      subtitle="Manage programs, semesters, sections, and subjects in a dedicated admin workflow."
      role="Admin"
    >
      <AdminWorkspaceNav />
      <section className="mt-8">
        <AdminCurriculumManager />
      </section>
    </AppShell>
  );
}
