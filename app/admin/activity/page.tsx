import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";
import { LogTable } from "@/components/log-table";
import { requireAdminPage } from "@/lib/auth";
import { getTeachingLogsData } from "@/lib/data-access";

export default async function AdminActivityPage() {
  await requireAdminPage();

  const logResult = await getTeachingLogsData();

  return (
    <AppShell
      title="Activity Review"
      subtitle="Review faculty log submissions in a focused screen without mixing analytics or curriculum controls."
      role="Admin"
    >
      <AdminWorkspaceNav />

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-800">Daily Log Review</h3>
            <p className="mt-2 text-sm leading-7 text-slate-500">The feed below comes from the unified logs API and is ready for filters and exports next.</p>
          </div>
          <div className="glass-panel w-full rounded-[1.25rem] px-4 py-3 text-sm text-slate-600 md:w-auto">
            {logResult.source === "supabase" ? "Synced with Supabase" : "Using local development fallback"}
          </div>
        </div>

        <LogTable logs={logResult.data} />
      </section>
    </AppShell>
  );
}
