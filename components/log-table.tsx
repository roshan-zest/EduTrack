import { formatHours } from "@/lib/format";
import { TeachingLog } from "@/lib/types";

export function LogTable({ logs }: { logs: TeachingLog[] }) {
  if (!logs.length) {
    return (
      <div className="glass-panel rounded-[1.75rem] p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">No Activity Yet</p>
        <h4 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-800">No teaching logs available</h4>
        <p className="mt-3 text-sm leading-7 text-slate-500">Once faculty logs are submitted, they will appear here with richer filters and export controls.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden rounded-[1.75rem]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/80 text-slate-500">
            <tr>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em]">Date</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em]">Teacher</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em]">Subject</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em]">Section</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em]">Duration</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em]">Method</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em]">Topic</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-200/50 transition hover:bg-white/60">
                <td className="px-5 py-4 text-slate-600">{log.date}</td>
                <td className="px-5 py-4 font-medium text-slate-800">{log.teacherName}</td>
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">{log.subject}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{log.program}</div>
                </td>
                <td className="px-5 py-4 text-slate-600">{log.section}</td>
                <td className="px-5 py-4 text-slate-600">{formatHours(log.startTime, log.endTime)}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {log.methodology}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600">{log.topic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
