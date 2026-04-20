"use client";

import { TeachingLog } from "@/lib/types";
import { downloadCSV, generateCSV, generateExportFilename, generateSummaryCSV } from "@/lib/export-utils";

type ExportButtonProps = {
  logs: TeachingLog[];
  department?: string;
  includesSummary?: boolean;
};

export function ExportButton({ logs, department = "All Departments", includesSummary = true }: ExportButtonProps) {
  const handleExportLogs = () => {
    const csv = generateCSV(logs);
    const filename = generateExportFilename("logs", department);
    downloadCSV(csv, filename);
  };

  const handleExportSummary = () => {
    const csv = generateSummaryCSV(logs, department);
    const filename = generateExportFilename("summary", department);
    downloadCSV(csv, filename);
  };

  const handleExportBoth = () => {
    // Export logs first
    const logsCSV = generateCSV(logs);
    const logsFilename = generateExportFilename("logs", department);
    downloadCSV(logsCSV, logsFilename);

    // Export summary after a small delay
    setTimeout(() => {
      const summaryCSV = generateSummaryCSV(logs, department);
      const summaryFilename = generateExportFilename("summary", department);
      downloadCSV(summaryCSV, summaryFilename);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        onClick={handleExportLogs}
        className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 active:bg-blue-200"
      >
        ▼ Export Logs
      </button>

      {includesSummary && (
        <>
          <button
            onClick={handleExportSummary}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 active:bg-emerald-200"
          >
            ▼ Export Summary
          </button>

          <button
            onClick={handleExportBoth}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 active:bg-indigo-200"
          >
            ▼ Export Both
          </button>
        </>
      )}
    </div>
  );
}
