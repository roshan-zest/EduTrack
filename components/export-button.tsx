"use client";

import { TeachingLog } from "@/lib/types";
import { downloadCSV, generateCSV, generateExportFilename, generateReportHTML, generateReportTitle } from "@/lib/export-utils";

type ExportButtonProps = {
  logs: TeachingLog[];
  department?: string;
};

export function ExportButton({ logs, department = "All Departments" }: ExportButtonProps) {
  const handleExportPDF = () => {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      return;
    }

    reportWindow.document.write(generateReportHTML(logs, department));
    reportWindow.document.close();
    // Set explicitly too — some browsers use this (not the written <title>) as the print filename
    reportWindow.document.title = generateReportTitle(department);
  };

  const handleExportCSV = () => {
    downloadCSV(generateCSV(logs), generateExportFilename("logs", department));
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        onClick={handleExportPDF}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 active:bg-slate-800"
      >
        ⎙ Export PDF Report
      </button>

      <button
        onClick={handleExportCSV}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100"
      >
        ▼ Raw Data (CSV)
      </button>
    </div>
  );
}
