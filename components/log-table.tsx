"use client";

import { useEffect, useMemo, useState } from "react";
import { formatHours } from "@/lib/format";
import { TeachingLog } from "@/lib/types";

export function LogTable({ logs }: { logs: TeachingLog[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));
  const pagedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return logs.slice(start, start + pageSize);
  }, [logs, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
      <div className="grid gap-3 p-4 md:hidden">
        {pagedLogs.map((log) => (
          <article key={log.id} className="rounded-[1.2rem] border border-slate-200/70 bg-white/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{log.date}</p>
                <h4 className="mt-1 text-base font-semibold text-slate-800">{log.subject}</h4>
                <p className="text-sm text-slate-500">{log.program}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {log.methodology}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
              <p>
                <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">Teacher</span>
                {log.teacherName}
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">Section</span>
                {log.section}
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">Duration</span>
                {formatHours(log.startTime, log.endTime)}
              </p>
              <p>
                <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">Topic</span>
                {log.topic}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden max-h-[560px] overflow-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-white/95 text-slate-500 backdrop-blur">
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
            {pagedLogs.map((log) => (
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

      {logs.length > pageSize ? (
        <div className="border-t border-slate-200/70 bg-white/55 px-4 py-3 md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, logs.length)} of {logs.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>
              <p className="min-w-16 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {page} / {totalPages}
              </p>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
