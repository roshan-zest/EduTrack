import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { LogFormWithUser } from "@/components/log-form";
import { requireAuthPage } from "@/lib/auth";

export default async function NewLogPage() {
  const auth = await requireAuthPage("/logs/new");

  return (
    <AppShell
      title="Submit Daily Teaching Log"
      subtitle="Capture subject coverage, class timing, methodology, and notes in a consistent format that can power analytics and reports."
      role={auth.role === "admin" ? "Admin" : "Teacher"}
    >
      <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-[1.9rem] p-6">
          <p className="text-sm leading-7 text-slate-500">
            Required fields follow the FAIS specification, but the flow is now structured: teachers first choose a program, then semester, then section, and then subject.
          </p>
        </div>
        <div className="rounded-[1.9rem] bg-slate-800 p-6 text-white soft-ring">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">New Behavior</p>
          <p className="mt-3 text-sm leading-7 text-white/78">
            Dropdown options are controlled from the admin dashboard. Update the curriculum catalog there and this page will use those values in prototype mode.
          </p>
        </div>
      </div>

      <LogFormWithUser
        user={{
          id: auth.user.id,
          name: auth.user.name,
          email: auth.user.email,
          role: auth.role
        }}
      />

      <div className="mt-6">
        <Link href="/teacher" className="text-sm font-medium text-slateBlue">
          Return to teacher dashboard
        </Link>
      </div>
    </AppShell>
  );
}
