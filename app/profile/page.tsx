import { AppShell } from "@/components/app-shell";
import { ProfileEditor } from "@/components/profile-editor";
import { teachers } from "@/lib/mock-data";
import { requireAuthPage } from "@/lib/auth";

function prettyDate(input?: string) {
  if (!input) {
    return "Not available";
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
}

export default async function ProfilePage() {
  const auth = await requireAuthPage("/profile");
  const teacherRecord = teachers.find((entry) => entry.email.toLowerCase() === auth.user.email.toLowerCase());
  const roleLabel = auth.role === "admin" ? "Admin" : "Teacher";

  return (
    <AppShell
      title="Your Profile"
      subtitle="View your account details, role, and activity metadata in one place."
      role={roleLabel}
    >
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[1.8rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">Account Overview</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-800">{auth.user.name}</h3>
          <p className="mt-2 text-sm text-slate-500">{auth.user.email}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.2rem] bg-white/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Role</p>
              <p className="mt-2 text-xl font-semibold text-slate-800">{roleLabel}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">User ID</p>
              <p className="mt-2 truncate text-sm font-medium text-slate-700">{auth.user.id}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Account Created</p>
              <p className="mt-2 text-sm font-medium text-slate-700">{prettyDate(auth.user.createdAt)}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Last Sign In</p>
              <p className="mt-2 text-sm font-medium text-slate-700">{prettyDate(auth.user.lastSignInAt)}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Phone</p>
              <p className="mt-2 text-sm font-medium text-slate-700">{auth.user.phone || "Not set"}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Designation</p>
              <p className="mt-2 text-sm font-medium text-slate-700">{auth.user.designation || "Not set"}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/75 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Bio</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{auth.user.bio || "No bio added yet."}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-panel rounded-[1.8rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Academic Mapping</p>
            <p className="mt-3 text-lg font-semibold text-slate-800">
              {auth.user.department || teacherRecord?.department || "Not mapped to faculty metadata"}
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Department and faculty profile fields can be extended from Supabase profile tables as your production schema grows.
            </p>
          </div>

          <ProfileEditor
            initialName={auth.user.name}
            initialPhone={auth.user.phone}
            initialDepartment={auth.user.department || teacherRecord?.department}
            initialDesignation={auth.user.designation}
            initialBio={auth.user.bio}
          />
        </div>
      </section>
    </AppShell>
  );
}
