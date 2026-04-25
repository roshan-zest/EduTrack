'use client';

import Link from "next/link";
import { Teacher } from "@/lib/types";

interface TeacherListTableProps {
  teacherStats: (Teacher & {
    logsCount: number;
    totalHours: number;
    lastActive: string;
  })[];
}

export function TeacherListTable({ teacherStats }: TeacherListTableProps) {
  return (
    <div className="overflow-hidden rounded-[1rem] border border-slate-200/70 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200/70">
            <tr>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Faculty Name</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Email</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Role</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Password</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 text-center">Sessions</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 text-center">Hours</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Last Active</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {teacherStats.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-slate-50/60 transition">
                <td className="px-4 py-3 font-semibold text-slate-900">{teacher.name}</td>
                <td className="px-4 py-3 text-slate-700 font-mono text-xs">{teacher.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                      teacher.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {teacher.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="rounded-[0.45rem] bg-slate-100 px-2 py-1 font-mono text-[11px] font-semibold text-slate-800 tracking-wide">
                    {teacher.password || "N/A"}
                  </code>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                    {teacher.logsCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-slate-800">{teacher.totalHours}h</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{teacher.lastActive}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/teachers/${teacher.id}`}
                    className="inline-flex items-center gap-1.5 rounded-[0.7rem] bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-800 active:scale-95"
                  >
                    View Profile →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {teacherStats.length === 0 && (
        <div className="px-4 py-10 text-center">
          <p className="text-sm text-slate-600">No teachers with recorded activity yet.</p>
        </div>
      )}
    </div>
  );
}
