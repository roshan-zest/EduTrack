import { ActivityTrendChart, MethodologyChart, WorkloadChart } from "@/components/charts";
import { AdminModuleCard } from "@/components/admin-module-card";
import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";
import { StatCard } from "@/components/stat-card";
import { requireAdminPage } from "@/lib/auth";
import { getTeachingLogsData } from "@/lib/data-access";
import { buildTeacherHours, durationHours } from "@/lib/admin-metrics";
import {
  activityTrend,
  methodologyDistribution,
  teachers
} from "@/lib/mock-data";

export default async function AdminDashboardPage() {
  await requireAdminPage();

  const logResult = await getTeachingLogsData();
  const teachingLogs = logResult.data;
  const teacherOnly = teachers.filter((entry) => entry.role === "teacher");
  const totalHours = teachingLogs.reduce((sum, entry) => sum + durationHours(entry.startTime, entry.endTime), 0);
  const chartData = buildTeacherHours(teachingLogs);

  return (
    <AppShell
      title="Administrative Workspace"
      subtitle="Use focused admin modules for curriculum management, activity review, and analytics instead of one crowded page."
      role="Admin"
    >
      <AdminWorkspaceNav />

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        <StatCard label="Total Teachers" value={String(teacherOnly.length)} caption="Faculty members currently active in the system" tone="primary" icon="◉" trend="+12% this month" />
        <StatCard label="Classes Conducted" value={String(teachingLogs.length)} caption="Live logs coming from the API-backed teaching activity feed" tone="neutral" icon="▣" trend="Updated live" />
        <StatCard label="Total Hours Taught" value={`${totalHours.toFixed(1)} hrs`} caption="Instructional time tracked across all faculty" tone="success" icon="↗" trend="Healthy coverage" />
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
        <AdminModuleCard
          eyebrow="Module 01"
          title="Curriculum Catalog Manager"
          description="Control programs, semesters, sections, and subjects in a dedicated workspace with inline editing."
          href="/admin/curriculum"
          accent="from-sky-500/18 via-white to-indigo-500/8"
        />
        <AdminModuleCard
          eyebrow="Module 02"
          title="Activity Review"
          description="Inspect the latest faculty logs in a cleaner review view without mixing in curriculum tools."
          href="/admin/activity"
          accent="from-emerald-500/14 via-white to-sky-500/8"
        />
        <AdminModuleCard
          eyebrow="Module 03"
          title="Analytics & Alerts"
          description="Track teaching hour distribution, methodology patterns, and system alerts in one focused page."
          href="/admin/insights"
          accent="from-violet-500/16 via-white to-pink-500/10"
        />
        <AdminModuleCard
          eyebrow="Module 04"
          title="Access Control"
          description="Assign admin roles so only authorized users can access the admin workspace."
          href="/admin/access"
          accent="from-amber-500/14 via-white to-orange-500/10"
        />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <WorkloadChart data={chartData} />
        <MethodologyChart data={methodologyDistribution} />
        <ActivityTrendChart data={activityTrend} />
      </section>
    </AppShell>
  );
}
