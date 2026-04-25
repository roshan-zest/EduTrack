import { EditTeacherForm } from "@/components/edit-teacher-form";
import { AppShell } from "@/components/app-shell";
import { AdminWorkspaceNav } from "@/components/admin-workspace-nav";
import { requireAdminPage } from "@/lib/auth";
import { getTeachersData } from "@/lib/data-access";
import Link from "next/link";

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdminPage();

  const { data: realTeachers } = await getTeachersData();
  const teacher = realTeachers.find((t) => t.id === id || t.id === decodeURIComponent(id));

  if (!teacher) {
    return (
      <AppShell title="Teacher Not Found" subtitle="This teacher could not be located." role="Admin">
        <AdminWorkspaceNav />
        <div className="mt-8 rounded-[1.6rem] border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">Teacher profile does not exist.</p>
          <Link href="/admin/teachers" className="mt-4 inline-block rounded-[1rem] bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Back to Teachers
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Edit - ${teacher.name}`} subtitle="Update teacher profile information" role="Admin">
      <AdminWorkspaceNav />

      <div className="mt-6 flex items-center gap-3">
        <Link
          href={`/admin/teachers/${id}`}
          className="rounded-[0.8rem] border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Cancel
        </Link>
      </div>

      <EditTeacherForm teacher={teacher} teacherId={id} />
    </AppShell>
  );
}
