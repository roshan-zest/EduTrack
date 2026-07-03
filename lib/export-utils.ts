import { TeachingLog } from "@/lib/types";
import { durationHours } from "@/lib/admin-metrics";

function normalizeTimeValue(value: string): string {
  if (!value) return "";

  // Expected local format in this app: HH:mm
  if (/^\d{1,2}:\d{2}$/.test(value)) {
    return value;
  }

  // Also handle HH:mm:ss and trim seconds for consistent export.
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(value)) {
    return value.slice(0, 5);
  }

  // If an ISO/DateTime sneaks in, attempt to format to HH:mm.
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    const hours = String(parsed.getHours()).padStart(2, "0");
    const minutes = String(parsed.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return value;
}

function safeDurationHours(startTime: string, endTime: string): number {
  const normalizedStart = normalizeTimeValue(startTime);
  const normalizedEnd = normalizeTimeValue(endTime);

  if (!/^\d{1,2}:\d{2}$/.test(normalizedStart) || !/^\d{1,2}:\d{2}$/.test(normalizedEnd)) {
    return 0;
  }

  const result = durationHours(normalizedStart, normalizedEnd);
  return Number.isFinite(result) ? result : 0;
}

/**
 * Convert teaching logs to CSV format
 */
export function generateCSV(logs: TeachingLog[]): string {
  if (logs.length === 0) {
    return "Date,Teacher Name,Teacher ID,Program,Semester,Subject,Section,Start Time,End Time,Duration (Hours),Methodology,Topic,Notes";
  }

  const headers = [
    "Date",
    "Teacher Name",
    "Teacher ID",
    "Program",
    "Semester",
    "Subject",
    "Section",
    "Start Time",
    "End Time",
    "Duration (Hours)",
    "Methodology",
    "Topic",
    "Notes"
  ];

  const rows = logs.map((log) => {
    const startTime = normalizeTimeValue(log.startTime);
    const endTime = normalizeTimeValue(log.endTime);
    const hours = safeDurationHours(log.startTime, log.endTime);

    return [
      log.date,
      log.teacherName,
      log.teacherId,
      log.program,
      log.semester,
      log.subject,
      log.section,
      startTime,
      endTime,
      hours.toFixed(2),
      log.methodology,
      log.topic,
      log.notes || ""
    ].map((field) => {
      // Escape quotes and wrap in quotes if contains comma or newline
      const str = String(field ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
  });

  // CRLF line endings so Excel parses rows/columns correctly
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\r\n");

  return csvContent;
}

/**
 * Shared report/export name: "edutrack-report[-Department]-YYYY-MM-DD".
 * Used for the PDF document title (which pre-fills the print "Save as" name).
 */
export function generateReportTitle(department: string = "All Departments"): string {
  const stamp = new Date().toISOString().split("T")[0];
  const deptSuffix =
    department && department !== "All Departments" ? `-${department.replace(/\s+/g, "-")}` : "";
  return `edutrack-report${deptSuffix}-${stamp}`;
}

function escapeHTML(value: string): string {
  return String(value ?? "").replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] as string
  );
}

/**
 * Build a printable HTML report. Opened in a new tab, the browser's print
 * dialog turns it into a PDF (zero dependencies, native pagination).
 */
export function generateReportHTML(logs: TeachingLog[], department: string = "All Departments"): string {
  const totalSessions = logs.length;
  const totalHours = logs.reduce((sum, log) => sum + safeDurationHours(log.startTime, log.endTime), 0);
  const avgHours = totalSessions ? totalHours / totalSessions : 0;

  const sortedDates = logs
    .map((log) => log.date)
    .filter(Boolean)
    .sort();
  const period = sortedDates.length
    ? `${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`
    : "No sessions recorded";

  const faculty = new Map<string, { sessions: number; hours: number }>();
  const methodology = new Map<string, number>();
  const programs = new Map<string, { sessions: number; hours: number }>();

  for (const log of logs) {
    const hours = safeDurationHours(log.startTime, log.endTime);

    const teacher = faculty.get(log.teacherName) ?? { sessions: 0, hours: 0 };
    teacher.sessions += 1;
    teacher.hours += hours;
    faculty.set(log.teacherName, teacher);

    methodology.set(log.methodology, (methodology.get(log.methodology) ?? 0) + 1);

    const program = programs.get(log.program) ?? { sessions: 0, hours: 0 };
    program.sessions += 1;
    program.hours += hours;
    programs.set(log.program, program);
  }

  const facultyRows = Array.from(faculty.entries()).sort((a, b) => b[1].hours - a[1].hours);
  const methodologyRows = Array.from(methodology.entries()).sort((a, b) => b[1] - a[1]);
  const programRows = Array.from(programs.entries()).sort((a, b) => b[1].sessions - a[1].sessions);

  const topTeacher = facultyRows[0];
  const topMethod = methodologyRows[0];
  const topProgram = programRows[0];

  const insights: string[] = [];
  if (topTeacher) {
    insights.push(
      `<strong>${escapeHTML(topTeacher[0])}</strong> leads faculty workload with ${topTeacher[1].hours.toFixed(1)} hours across ${topTeacher[1].sessions} sessions.`
    );
  }
  if (topMethod && totalSessions) {
    insights.push(
      `<strong>${escapeHTML(topMethod[0])}</strong> is the most used teaching method (${((topMethod[1] / totalSessions) * 100).toFixed(0)}% of sessions).`
    );
  }
  if (topProgram) {
    insights.push(
      `<strong>${escapeHTML(topProgram[0])}</strong> received the most attention: ${topProgram[1].sessions} sessions, ${topProgram[1].hours.toFixed(1)} hours.`
    );
  }
  if (faculty.size > 1) {
    insights.push(
      `On average each of the ${faculty.size} faculty members logged ${(totalSessions / faculty.size).toFixed(1)} sessions (${(totalHours / faculty.size).toFixed(1)} hours).`
    );
  }

  const generatedAt = new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });
  const reportTitle = generateReportTitle(department);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHTML(reportTitle)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 16mm; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #1e293b; font-size: 12px; line-height: 1.5; }
  header { border-bottom: 3px solid #0f172a; padding-bottom: 12px; margin-bottom: 18px; }
  h1 { font-size: 22px; letter-spacing: -0.02em; }
  .meta { margin-top: 6px; color: #64748b; font-size: 11px; }
  .meta strong { color: #334155; }
  h2 { font-size: 14px; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #cbd5e1; color: #0f172a; letter-spacing: 0.02em; text-transform: uppercase; }
  .kpis { display: flex; gap: 10px; margin-top: 4px; }
  .kpi { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #f8fafc; }
  .kpi .num { font-size: 20px; font-weight: 700; color: #0f172a; }
  .kpi .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-top: 2px; }
  ul.insights { margin: 6px 0 0 16px; }
  ul.insights li { margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { background: #0f172a; color: #fff; text-align: left; padding: 6px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; }
  td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  tr:nth-child(even) td { background: #f8fafc; }
  td.num, th.num { text-align: right; }
  section { break-inside: avoid; }
  section.logs { break-inside: auto; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #cbd5e1; color: #94a3b8; font-size: 10px; }
  @media screen { body { max-width: 800px; margin: 24px auto; padding: 0 16px; } }
</style>
</head>
<body>
  <header>
    <h1>EduTrack — Faculty Activity Report</h1>
    <p class="meta">
      <strong>Department:</strong> ${escapeHTML(department)} &nbsp;·&nbsp;
      <strong>Period:</strong> ${escapeHTML(period)} &nbsp;·&nbsp;
      <strong>Generated:</strong> ${escapeHTML(generatedAt)}
    </p>
  </header>

  <section>
    <div class="kpis">
      <div class="kpi"><div class="num">${totalSessions}</div><div class="lbl">Teaching Sessions</div></div>
      <div class="kpi"><div class="num">${totalHours.toFixed(1)}</div><div class="lbl">Hours Taught</div></div>
      <div class="kpi"><div class="num">${faculty.size}</div><div class="lbl">Faculty Members</div></div>
      <div class="kpi"><div class="num">${avgHours.toFixed(1)}</div><div class="lbl">Avg Hours / Session</div></div>
    </div>
  </section>

  ${insights.length ? `<section><h2>Key Insights</h2><ul class="insights">${insights.map((line) => `<li>${line}</li>`).join("")}</ul></section>` : ""}

  <section>
    <h2>Faculty Workload</h2>
    <table>
      <thead><tr><th>Teacher</th><th class="num">Sessions</th><th class="num">Hours</th><th class="num">Avg Hrs / Session</th></tr></thead>
      <tbody>
        ${facultyRows
          .map(
            ([name, stats]) =>
              `<tr><td>${escapeHTML(name)}</td><td class="num">${stats.sessions}</td><td class="num">${stats.hours.toFixed(1)}</td><td class="num">${(stats.hours / stats.sessions).toFixed(1)}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Teaching Methodology</h2>
    <table>
      <thead><tr><th>Method</th><th class="num">Sessions</th><th class="num">Share</th></tr></thead>
      <tbody>
        ${methodologyRows
          .map(
            ([name, count]) =>
              `<tr><td>${escapeHTML(name)}</td><td class="num">${count}</td><td class="num">${totalSessions ? ((count / totalSessions) * 100).toFixed(1) : 0}%</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Program Coverage</h2>
    <table>
      <thead><tr><th>Program</th><th class="num">Sessions</th><th class="num">Hours</th></tr></thead>
      <tbody>
        ${programRows
          .map(
            ([name, stats]) =>
              `<tr><td>${escapeHTML(name)}</td><td class="num">${stats.sessions}</td><td class="num">${stats.hours.toFixed(1)}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
  </section>

  <section class="logs">
    <h2>Session Log (${totalSessions})</h2>
    <table>
      <thead><tr><th>Date</th><th>Teacher</th><th>Subject</th><th>Program</th><th>Time</th><th class="num">Hrs</th><th>Method</th><th>Topic</th></tr></thead>
      <tbody>
        ${logs
          .map(
            (log) =>
              `<tr><td>${escapeHTML(log.date)}</td><td>${escapeHTML(log.teacherName)}</td><td>${escapeHTML(log.subject)}</td><td>${escapeHTML(log.program)}</td><td>${escapeHTML(normalizeTimeValue(log.startTime))}–${escapeHTML(normalizeTimeValue(log.endTime))}</td><td class="num">${safeDurationHours(log.startTime, log.endTime).toFixed(1)}</td><td>${escapeHTML(log.methodology)}</td><td>${escapeHTML(log.topic)}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
  </section>

  <footer>EduTrack · Faculty Activity &amp; Insights System · This report was generated automatically from teaching logs.</footer>

  <script>
    window.addEventListener("load", function () {
      setTimeout(function () { window.print(); }, 300);
    });
  </script>
</body>
</html>`;
}

/**
 * Download CSV file to user's browser
 */
export function downloadCSV(content: string, filename: string): void {
  // Blob + UTF-8 BOM so Excel detects encoding and columns; avoids data-URI size limits
  const blob = new Blob(["﻿", content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const element = document.createElement("a");
  element.href = url;
  element.download = filename;
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(type: "logs" | "summary", department: string = ""): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const deptSuffix = department && department !== "All Departments" ? `-${department.replace(/\s+/g, "-")}` : "";
  return `edutrack-${type}${deptSuffix}-${timestamp}.csv`;
}
