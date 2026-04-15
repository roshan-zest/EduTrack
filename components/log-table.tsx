import { formatHours } from "@/lib/format";
import { TeachingLog } from "@/lib/types";

export function LogTable({ logs }: { logs: TeachingLog[] }) {
  return (
    <div className="glass-panel overflow-hidden rounded-[1.75rem]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/65 text-slate-500">
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
              <tr key={log.id} className="border-t border-slate-200/50">
                <td className="px-5 py-4 text-slate-600">{log.date}</td>
                <td className="px-5 py-4 font-medium text-slate-800">{log.teacherName}</td>
                <td className="px-5 py-4 text-slate-700">{log.subject}</td>
                <td className="px-5 py-4 text-slate-600">{log.section}</td>
                <td className="px-5 py-4 text-slate-600">{formatHours(log.startTime, log.endTime)}</td>
                <td className="px-5 py-4 text-slate-600">{log.methodology}</td>
                <td className="px-5 py-4 text-slate-600">{log.topic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
