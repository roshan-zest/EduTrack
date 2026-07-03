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

type TeacherStat = { sessions: number; hours: number };

type ReportModel = {
  title: string;
  department: string;
  period: string;
  generatedAt: string;
  totalSessions: number;
  totalHours: number;
  avgHours: number;
  facultySize: number;
  facultyRows: Array<[string, TeacherStat]>;
  methodologyRows: Array<[string, number]>;
  programRows: Array<[string, TeacherStat]>;
  insights: string[];
};

function buildReportModel(logs: TeachingLog[], department: string): ReportModel {
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

  const faculty = new Map<string, TeacherStat>();
  const methodology = new Map<string, number>();
  const programs = new Map<string, TeacherStat>();

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
      `${topTeacher[0]} leads faculty workload with ${topTeacher[1].hours.toFixed(1)} hours across ${topTeacher[1].sessions} sessions.`
    );
  }
  if (topMethod && totalSessions) {
    insights.push(
      `${topMethod[0]} is the most used teaching method (${((topMethod[1] / totalSessions) * 100).toFixed(0)}% of sessions).`
    );
  }
  if (topProgram) {
    insights.push(
      `${topProgram[0]} received the most attention: ${topProgram[1].sessions} sessions, ${topProgram[1].hours.toFixed(1)} hours.`
    );
  }
  if (faculty.size > 1) {
    insights.push(
      `On average each of the ${faculty.size} faculty members logged ${(totalSessions / faculty.size).toFixed(1)} sessions (${(totalHours / faculty.size).toFixed(1)} hours).`
    );
  }

  return {
    title: generateReportTitle(department),
    department,
    period,
    generatedAt: new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }),
    totalSessions,
    totalHours,
    avgHours,
    facultySize: faculty.size,
    facultyRows,
    methodologyRows,
    programRows,
    insights
  };
}

const NAVY: [number, number, number] = [15, 23, 42];
const SLATE: [number, number, number] = [100, 116, 139];

/**
 * Generate and directly download a formatted PDF report (no print dialog).
 * jsPDF + autotable are dynamic-imported so they stay out of the initial bundle.
 */
export async function downloadReportPDF(logs: TeachingLog[], department: string = "All Departments"): Promise<void> {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableModule.default;

  const model = buildReportModel(logs, department);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text("EduTrack - Faculty Activity Report", margin, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE);
  doc.text(
    `Department: ${model.department}   -   Period: ${model.period}   -   Generated: ${model.generatedAt}`,
    margin,
    y
  );
  y += 6;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageW - margin, y);
  y += 18;

  const finalY = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  const heading = (text: string) => {
    if (y > pageH - 90) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    doc.text(text.toUpperCase(), margin, y);
    y += 5;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 12;
  };

  autoTable(doc, {
    startY: y,
    theme: "grid",
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, halign: "center", cellPadding: 6 },
    headStyles: { fillColor: NAVY, halign: "center" },
    head: [["Teaching Sessions", "Hours Taught", "Faculty Members", "Avg Hours / Session"]],
    body: [
      [
        String(model.totalSessions),
        model.totalHours.toFixed(1),
        String(model.facultySize),
        model.avgHours.toFixed(1)
      ]
    ]
  });
  y = finalY() + 22;

  if (model.insights.length) {
    heading("Key Insights");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    for (const line of model.insights) {
      const wrapped = doc.splitTextToSize(`-  ${line}`, pageW - margin * 2) as string[];
      if (y + wrapped.length * 12 > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(wrapped, margin, y);
      y += wrapped.length * 12 + 3;
    }
    y += 8;
  }

  heading("Faculty Workload");
  autoTable(doc, {
    startY: y,
    theme: "striped",
    margin: { left: margin, right: margin },
    styles: { fontSize: 8.5, cellPadding: 4 },
    headStyles: { fillColor: NAVY },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
    head: [["Teacher", "Sessions", "Hours", "Avg Hrs / Session"]],
    body: model.facultyRows.map(([name, stats]) => [
      name,
      String(stats.sessions),
      stats.hours.toFixed(1),
      (stats.hours / stats.sessions).toFixed(1)
    ])
  });
  y = finalY() + 22;

  heading("Teaching Methodology");
  autoTable(doc, {
    startY: y,
    theme: "striped",
    margin: { left: margin, right: margin },
    styles: { fontSize: 8.5, cellPadding: 4 },
    headStyles: { fillColor: NAVY },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    head: [["Method", "Sessions", "Share"]],
    body: model.methodologyRows.map(([name, count]) => [
      name,
      String(count),
      `${model.totalSessions ? ((count / model.totalSessions) * 100).toFixed(1) : 0}%`
    ])
  });
  y = finalY() + 22;

  heading("Program Coverage");
  autoTable(doc, {
    startY: y,
    theme: "striped",
    margin: { left: margin, right: margin },
    styles: { fontSize: 8.5, cellPadding: 4 },
    headStyles: { fillColor: NAVY },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    head: [["Program", "Sessions", "Hours"]],
    body: model.programRows.map(([name, stats]) => [name, String(stats.sessions), stats.hours.toFixed(1)])
  });
  y = finalY() + 22;

  heading(`Session Log (${model.totalSessions})`);
  autoTable(doc, {
    startY: y,
    theme: "striped",
    margin: { left: margin, right: margin },
    styles: { fontSize: 7.5, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: NAVY },
    columnStyles: { 5: { halign: "right" } },
    head: [["Date", "Teacher", "Subject", "Program", "Time", "Hrs", "Method", "Topic"]],
    body: logs.map((log) => [
      log.date,
      log.teacherName,
      log.subject,
      log.program,
      `${normalizeTimeValue(log.startTime)}-${normalizeTimeValue(log.endTime)}`,
      safeDurationHours(log.startTime, log.endTime).toFixed(1),
      log.methodology,
      log.topic
    ])
  });

  doc.save(`${model.title}.pdf`);
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
