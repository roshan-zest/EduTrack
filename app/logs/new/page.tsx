import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DailyLogTable } from "@/components/daily-log-table";

export default function NewLogPage() {
  return (
    <AppShell
      title="Submit Daily Teaching Log"
      subtitle="Capture subject coverage, class timing, methodology, and notes in a consistent format that can power analytics and reports."
      role="Teacher"
    >
      <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-[1.9rem] p-6">
          <p className="text-sm leading-7 text-slate-500">
            Fill out your entire day&apos;s activity in the table below. Use the &quot;Office Work&quot; toggle for non-teaching periods.
          </p>
        </div>
        <div className="rounded-[1.9rem] bg-slate-800 p-6 text-white soft-ring">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">New Behavior</p>
          <p className="mt-3 text-sm leading-7 text-white/78">
            Dropdown options are controlled from the admin dashboard. Time slots are pre-filled, and you can submit your entire day at once.
          </p>
        </div>
      </div>

      <div className="w-full">
        <DailyLogTable />
      </div>

      <div className="mt-6">
        <Link href="/teacher" className="text-sm font-medium text-slateBlue">
          Return to teacher dashboard
        </Link>
      </div>
    </AppShell>
  );
}
