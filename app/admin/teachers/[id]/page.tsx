import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";
import { TeacherProfileHeader } from "@/components/teacher-profile-header";
import { StatCard } from "@/components/stat-card";
import { requireAdminPage } from "@/lib/auth";
import { getTeachingLogsData, getTeachersData } from "@/lib/data-access";
import { durationHours, buildTeacherHours, buildMethodologyDistribution } from "@/lib/admin-metrics";
import { MethodologyChart } from "@/components/charts";

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdminPage();

  const { data: realTeachers } = await getTeachersData();
  const teacher = realTeachers.find((t) => t.id === id || t.id === decodeURIComponent(id));

  if (!teacher) {
    return (
      <AppShell title="Teacher Not Found" subtitle="This teacher could not be located." role="Admin">
        <AdminWorkspaceNav />
        <div className="mt-8 rounded-[1.6rem] border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">Teacher profile does not exist. Please check the ID and try again.</p>
          <Link href="/admin/teachers" className="mt-4 inline-block rounded-[1rem] bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Back to Teachers
          </Link>
        </div>
      </AppShell>
    );
  }

  const logResult = await getTeachingLogsData();
  const allLogs = logResult.data;

  const teacherLogs = allLogs
    .filter((log) => log.teacherId === teacher.id || log.teacherName.toLowerCase() === teacher.name.toLowerCase())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalHours = teacherLogs.reduce((sum, log) => sum + durationHours(log.startTime, log.endTime), 0);
  const avgHoursPerSession = teacherLogs.length > 0 ? totalHours / teacherLogs.length : 0;
  const uniqueSubjects = new Set(teacherLogs.map((log) => log.subject)).size;
  const methodologyData = buildMethodologyDistribution(teacherLogs);

  const subjects = Array.from(new Set(teacherLogs.map((log) => log.subject))).map((subject) => ({
    subject,
    count: teacherLogs.filter((log) => log.subject === subject).length
  }));

  return (
    <AppShell
      title="Teacher Profile"
      subtitle="View activity, courses, teaching methods, and student engagement metrics."
      role="Admin"
    >
      <AdminWorkspaceNav />

      <TeacherProfileHeader initialTeacher={teacher} />

      <div className="mt-6 flex items-center justify-between gap-3">
        <Link
          href="/admin/teachers"
          className="rounded-[0.8rem] border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Back to Directory
        </Link>
        <Link
          href={`/admin/teachers/${teacher.id}/edit`}
          className="rounded-[0.8rem] bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95"
        >
          Edit Profile
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Sessions"
          value={String(teacherLogs.length)}
          caption="Teaching logs recorded"
          tone="primary"
          icon="▣"
          trend="Live from logs"
        />
        <StatCard
          label="Total Hours"
          value={`${totalHours.toFixed(1)} hrs`}
          caption="Instructional time tracked"
          tone="neutral"
          icon="⏱"
          trend="Calculated metric"
        />
        <StatCard
          label="Avg Session"
          value={`${avgHoursPerSession.toFixed(1)} hrs`}
          caption="Average duration per class"
          tone="success"
          icon="↗"
          trend="Performance indicator"
        />
        <StatCard
          label="Unique Subjects"
          value={String(uniqueSubjects)}
          caption="Different courses taught"
          tone="neutral"
          icon="◎"
          trend="Course coverage"
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Activity Overview</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">Teaching Sessions</h3>
          </div>

          <div className="max-h-[640px] overflow-auto rounded-[1.2rem] border border-slate-200/70">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white/95 text-slate-500 backdrop-blur">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Subject</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Topic</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Method</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em]">Time</th>
                </tr>
              </thead>
              <tbody>
                {teacherLogs.map((log) => {
                  const duration = durationHours(log.startTime, log.endTime);
                  return (
                    <tr key={log.id} className="border-t border-slate-200/60 hover:bg-white/60">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {new Date(log.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{log.subject}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="max-w-xs truncate" title={log.topic}>
                          {log.topic}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{log.methodology}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {duration.toFixed(1)}h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {teacherLogs.length === 0 && (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-slate-500">No teaching logs recorded yet for this teacher.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Courses Taught</p>
            <div className="mt-4 space-y-2">
              {subjects.map((item) => (
                <div key={item.subject} className="rounded-[1rem] border border-slate-200 bg-white/70 p-3">
                  <p className="text-sm font-semibold text-slate-800">{item.subject}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.count} session{item.count !== 1 ? "s" : ""}</p>
                </div>
              ))}
            </div>

            {subjects.length === 0 && <p className="mt-3 text-sm text-slate-500">No courses recorded.</p>}
          </div>

          {methodologyData.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Teaching Methods</p>
              <div className="mt-4 space-y-2">
                {methodologyData.map((method) => (
                  <div key={method.name} className="rounded-[1rem] border border-slate-200 bg-white/70 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">{method.name}</p>
                      <span className="text-xs font-semibold text-slate-500">{method.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
