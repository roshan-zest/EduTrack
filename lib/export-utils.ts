import { TeachingLog } from "@/lib/types";
import { durationHours } from "@/lib/admin-metrics";

export interface ExportData {
  logs: TeachingLog[];
  department?: string;
  timestamp: string;
}

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

function exportTimestampLabel(): string {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().slice(0, 8);
  return `${date} ${time}`;
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

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\n");

  return csvContent;
}

/**
 * Generate summary statistics CSV
 */
export function generateSummaryCSV(
  logs: TeachingLog[],
  department: string = "All Departments"
): string {
  const totalLogs = logs.length;
  const uniqueTeachers = new Set(logs.map((log) => log.teacherId)).size;
  const totalHours = logs.reduce((sum, log) => sum + safeDurationHours(log.startTime, log.endTime), 0);

  const methodologyCount: Record<string, number> = {};
  logs.forEach((log) => {
    methodologyCount[log.methodology] = (methodologyCount[log.methodology] ?? 0) + 1;
  });

  const programCount: Record<string, number> = {};
  logs.forEach((log) => {
    programCount[log.program] = (programCount[log.program] ?? 0) + 1;
  });

  const teacherHours: Record<string, number> = {};
  logs.forEach((log) => {
    const duration = safeDurationHours(log.startTime, log.endTime);
    teacherHours[log.teacherName] = (teacherHours[log.teacherName] ?? 0) + duration;
  });

  let csv = "SUMMARY STATISTICS\n";
  csv += `Export Date,${exportTimestampLabel()}\n`;
  csv += `Department Filter,${department}\n`;
  csv += `\n`;
  csv += `OVERVIEW\n`;
  csv += `Total Teaching Sessions,${totalLogs}\n`;
  csv += `Unique Faculty Members,${uniqueTeachers}\n`;
  csv += `Total Hours Tracked,${totalHours.toFixed(2)}\n`;
  csv += `Average Hours per Session,${(totalLogs ? totalHours / totalLogs : 0).toFixed(2)}\n`;
  csv += `\n`;
  csv += `METHODOLOGY BREAKDOWN\n`;
  Object.entries(methodologyCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([method, count]) => {
      const percentage = ((count / totalLogs) * 100).toFixed(1);
      csv += `${method},${count},${percentage}%\n`;
    });

  csv += `\n`;
  csv += `PROGRAM BREAKDOWN\n`;
  Object.entries(programCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([program, count]) => {
      csv += `${program},${count}\n`;
    });

  csv += `\n`;
  csv += `FACULTY WORKLOAD (Hours)\n`;
  Object.entries(teacherHours)
    .sort((a, b) => b[1] - a[1])
    .forEach(([teacher, hours]) => {
      csv += `${teacher},${hours.toFixed(2)}\n`;
    });

  return csv;
}

/**
 * Download CSV file to user's browser
 */
export function downloadCSV(content: string, filename: string): void {
  const element = document.createElement("a");
  element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(type: "logs" | "summary", department: string = ""): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const deptSuffix = department && department !== "All Departments" ? `-${department.replace(/\s+/g, "-")}` : "";
  return `edutrack-${type}${deptSuffix}-${timestamp}.csv`;
}
