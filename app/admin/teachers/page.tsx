import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";
import { TeacherListTable } from "@/components/teacher-list-table";
import { requireAdminPage } from "@/lib/auth";
import { getTeachingLogsData, getTeachersData } from "@/lib/data-access";
import { durationHours, countUniqueTeachers } from "@/lib/admin-metrics";

export default async function AdminTeachersPage() {
  const [, logResult, teachersResult] = await Promise.all([
    requireAdminPage(),
    getTeachingLogsData(),
    getTeachersData()
  ]);

  const teachingLogs = logResult.data;
  const teachers = teachersResult.data;

  const teacherStats = teachers
    .filter((t) => t.role === "teacher")
    .map((teacher) => {
      const teacherLogs = teachingLogs.filter(
        (log) => log.teacherId === teacher.id || log.teacherName.toLowerCase() === teacher.name.toLowerCase()
      );
      const totalHours = teacherLogs.reduce((sum, log) => sum + durationHours(log.startTime, log.endTime), 0);

      return {
        ...teacher,
        logsCount: teacherLogs.length,
        totalHours: Number(totalHours.toFixed(1)),
        lastActive: teacherLogs.length > 0 ? new Date(teacherLogs[0].date).toLocaleDateString() : "No activity"
      };
    })
    .sort((a, b) => b.logsCount - a.logsCount);

  const totalTeachers = countUniqueTeachers(teachingLogs);

  return (
    <AppShell
      title="Teacher Management"
      subtitle="View all teachers, track activity, and manage faculty engagement."
      role="Admin"
    >
      <AdminWorkspaceNav />

      {/* Summary Stats */}
      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.3rem] border border-slate-200 bg-white/80 p-4 md:p-5 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Active Teachers</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-[2rem]">{totalTeachers}</p>
          <p className="mt-2 text-sm text-slate-600">Faculty with recorded activities</p>
        </div>

        <div className="rounded-[1.3rem] border border-slate-200 bg-white/80 p-4 md:p-5 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Total Sessions</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-[2rem]">{teachingLogs.length}</p>
          <p className="mt-2 text-sm text-slate-600">Teaching logs across all faculty</p>
        </div>

        <div className="rounded-[1.3rem] border border-slate-200 bg-white/80 p-4 md:p-5 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Total Hours</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900 md:text-[2rem]">
            {teachingLogs.reduce((sum, log) => sum + durationHours(log.startTime, log.endTime), 0).toFixed(0)}
          </p>
          <p className="mt-2 text-sm text-slate-600">Instructional time logged</p>
        </div>
      </section>

      {/* Teachers List Table */}
      <section className="mt-7 md:mt-8">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Faculty Directory</p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-slate-900 md:text-[1.9rem]">BCA Department Teachers</h2>
        </div>

        <TeacherListTable teacherStats={teacherStats} />
      </section>
    </AppShell>
  );
}
