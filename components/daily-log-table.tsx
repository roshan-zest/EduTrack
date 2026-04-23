"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCatalog } from "@/lib/catalog";
import { CurriculumCatalog } from "@/lib/types";

const teachingMethodologies = [
  "Interactive Lecture",
  "Lab Session",
  "Problem Solving",
  "Case Discussion",
  "Presentation",
  "Tutorial",
  "Workshop"
] as const;

type RowType = "class" | "break" | "office";

interface TableRow {
  id: string;
  timeRange: string;
  type: RowType;
  programId: string;
  semesterId: string;
  sectionId: string;
  subjectId: string;
  topic: string;
  methodology: string;
  notes: string;
  customInfo: string;
}

const defaultTimeSlots = [
  { timeRange: "8:30-9:30", type: "class" as RowType },
  { timeRange: "9:30-10:30", type: "class" as RowType },
  { timeRange: "10:30-11:00", type: "break" as RowType },
  { timeRange: "11:00-12:00", type: "class" as RowType },
  { timeRange: "12:00-1:00", type: "class" as RowType },
  { timeRange: "1:00-2:00", type: "class" as RowType },
  { timeRange: "2:00-2:30", type: "break" as RowType },
  { timeRange: "2:30-3:30", type: "class" as RowType },
  { timeRange: "3:30-4:30", type: "class" as RowType },
  { timeRange: "4:30-5:30", type: "class" as RowType }
];

function generateInitialRows(): TableRow[] {
  return defaultTimeSlots.map((slot, idx) => ({
    id: `row-${idx}`,
    timeRange: slot.timeRange,
    type: slot.type,
    programId: "",
    semesterId: "",
    sectionId: "",
    subjectId: "",
    topic: "",
    methodology: "",
    notes: "",
    customInfo: ""
  }));
}

export function DailyLogTable({ teacherId, teacherName }: { teacherId: string; teacherName: string }) {
  const [catalog, setCatalog] = useState<CurriculumCatalog>([]);
  const [rows, setRows] = useState<TableRow[]>(generateInitialRows());
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Loading curriculum...");
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      const payload = await fetchCatalog();
      if (cancelled) {
        return;
      }
      setCatalog(payload.data);
      setStatus(payload.source === "supabase" ? "Curriculum synced" : "Using local fallback");
    }

    loadCatalog();
    setDate(new Date().toISOString().split("T")[0]);

    return () => {
      cancelled = true;
    };
  }, []);

  function handleRowChange(id: string, field: keyof TableRow, value: string) {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== id) return row;

        if (field === "programId") {
          return { ...row, programId: value, semesterId: "", sectionId: "", subjectId: "" };
        }
        if (field === "semesterId") {
          return { ...row, semesterId: value, sectionId: "", subjectId: "" };
        }
        return { ...row, [field]: value };
      })
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        id: `row-${Date.now()}`,
        timeRange: "",
        type: "class",
        programId: "",
        semesterId: "",
        sectionId: "",
        subjectId: "",
        topic: "",
        methodology: "",
        notes: "",
        customInfo: ""
      }
    ]);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setSubmittedMessage("");

    // Filter valid rows: non-break rows that have at least some data
    const validRows = rows.filter((row) => {
      if (row.type === "break") return false;
      if (row.type === "office") return !!row.customInfo;
      // For class, need basic selections
      return row.programId && row.semesterId && row.subjectId;
    });

    if (validRows.length === 0) {
      setSubmittedMessage("No valid entries to submit.");
      setSubmitting(false);
      return;
    }

    // Construct payloads
    const payloads = validRows.map((row) => {
      const [start, end] = row.timeRange.split("-");
      // Format start and end safely
      const formatTime = (t: string) => {
        if (!t) return "00:00";
        let [h, m] = t.split(":");
        if (!m) return `${h.padStart(2, "0")}:00`;
        return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
      };

      if (row.type === "office") {
        return {
          teacherId,
          teacherName,
          program: "Office Work",
          semester: "N/A",
          subject: "N/A",
          section: "N/A",
          startTime: formatTime(start),
          endTime: formatTime(end),
          methodology: "Other",
          topic: "Office Work",
          notes: row.customInfo,
          date: date
        };
      }

      const program = catalog.find((p) => p.id === row.programId);
      const semester = program?.semesters.find((s) => s.id === row.semesterId);
      const section = semester?.sections.find((s) => s.id === row.sectionId);
      const subject = semester?.subjects.find((s) => s.id === row.subjectId);

      return {
        teacherId,
        teacherName,
        program: program?.name ?? "",
        semester: semester?.name ?? "",
        subject: subject?.name ?? "",
        section: section?.name ?? "N/A",
        startTime: formatTime(start),
        endTime: formatTime(end),
        methodology: row.methodology || "Interactive Lecture",
        topic: row.topic || "N/A",
        notes: row.notes || "",
        date: date
      };
    });

    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloads)
      });

      if (!response.ok) throw new Error("Failed to submit");
      setSubmittedMessage("Daily logs submitted successfully.");
    } catch (error) {
      setSubmittedMessage("Error submitting logs.");
    }

    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[1.9rem] p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-500">Daily Entry</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-800">Teaching Session Table</h3>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="date"
              required
              className="apple-input rounded-xl px-4 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="glass-panel rounded-[1.25rem] px-4 py-2 text-sm text-slate-600">{status}</div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-700 text-white">
              <tr>
                <th className="whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-wider text-xs">SL NO</th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-wider text-xs">TIME</th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-wider text-xs w-[12%]">CLASS</th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-wider text-xs w-[12%]">SEM</th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-wider text-xs w-[15%]">SUBJECT</th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-wider text-xs w-[15%]">TOPIC</th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-wider text-xs w-[15%]">METHODOLOGY</th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-wider text-xs">DECP</th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-wider text-xs">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {rows.map((row, index) => {
                const isBreak = row.type === "break";
                const isOffice = row.type === "office";

                const selectedProgram = catalog.find((p) => p.id === row.programId);
                const semesters = selectedProgram?.semesters ?? [];
                const selectedSemester = semesters.find((s) => s.id === row.semesterId);
                const sections = selectedSemester?.sections ?? [];
                const subjects = selectedSemester?.subjects ?? [];

                return (
                  <tr key={row.id} className={isBreak ? "bg-slate-50 text-slate-400" : isOffice ? "bg-blue-50/30" : "hover:bg-slate-50/50"}>
                    <td className="px-3 py-2 font-medium text-slate-500 text-center">{index + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="w-[90px] rounded-md border-slate-300 px-2 py-1.5 text-xs bg-transparent focus:bg-white focus:ring-1 focus:ring-slate-300 outline-none transition-colors"
                        value={row.timeRange}
                        onChange={(e) => handleRowChange(row.id, "timeRange", e.target.value)}
                        readOnly={isBreak}
                        placeholder="HH:MM-HH:MM"
                      />
                    </td>
                    
                    {isBreak ? (
                      <td colSpan={6} className="px-3 py-2 text-center text-xs font-semibold tracking-widest text-slate-400 uppercase">
                        -- break --
                      </td>
                    ) : isOffice ? (
                      <td colSpan={6} className="px-3 py-2">
                        <input
                          type="text"
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                          placeholder="Describe office work or other tasks..."
                          value={row.customInfo}
                          onChange={(e) => handleRowChange(row.id, "customInfo", e.target.value)}
                        />
                      </td>
                    ) : (
                      <>
                        <td className="px-3 py-2">
                          <select
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                            value={row.programId}
                            onChange={(e) => handleRowChange(row.id, "programId", e.target.value)}
                          >
                            <option value="">Select</option>
                            {catalog.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            disabled={!row.programId}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
                            value={row.semesterId}
                            onChange={(e) => handleRowChange(row.id, "semesterId", e.target.value)}
                          >
                            <option value="">Select</option>
                            {semesters.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            disabled={!row.semesterId}
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
                            value={row.subjectId}
                            onChange={(e) => handleRowChange(row.id, "subjectId", e.target.value)}
                          >
                            <option value="">Select</option>
                            {subjects.map((sub) => (
                              <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                            placeholder="Topic..."
                            value={row.topic}
                            onChange={(e) => handleRowChange(row.id, "topic", e.target.value)}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                            value={row.methodology}
                            onChange={(e) => handleRowChange(row.id, "methodology", e.target.value)}
                          >
                            <option value="">Select</option>
                            {teachingMethodologies.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                            placeholder="Desc..."
                            value={row.notes}
                            onChange={(e) => handleRowChange(row.id, "notes", e.target.value)}
                          />
                        </td>
                      </>
                    )}

                    <td className="px-3 py-2 text-center">
                      {!isBreak && (
                        <button
                          type="button"
                          onClick={() => handleRowChange(row.id, "type", isOffice ? "class" : "office")}
                          className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                            isOffice ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {isOffice ? "Class Mode" : "Office Work"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="text-lg leading-none">+</span> Add Row
          </button>
        </div>

      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="premium-button rounded-[1.25rem] bg-slate-900 px-8 py-4 text-sm font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Saving..." : "Submit Entire Day"}
        </button>

        {submittedMessage && (
          <p className="text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
            {submittedMessage}
          </p>
        )}
      </div>
    </div>
  );
}
