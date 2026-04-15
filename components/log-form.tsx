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

const initialState = {
  programId: "",
  semesterId: "",
  sectionId: "",
  subjectId: "",
  startTime: "",
  endTime: "",
  topic: "",
  methodology: "",
  notes: "",
  date: ""
};

function FieldShell({
  label,
  helper,
  children
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {helper ? <span className="text-xs text-slate-500">{helper}</span> : null}
    </label>
  );
}

export function LogForm() {
  const [catalog, setCatalog] = useState<CurriculumCatalog>([]);
  const [formState, setFormState] = useState(initialState);
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [status, setStatus] = useState("Loading curriculum...");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      const payload = await fetchCatalog();
      if (cancelled) {
        return;
      }

      setCatalog(payload.data);
      setStatus(payload.source === "supabase" ? "Curriculum synced from Supabase" : "Using local curriculum fallback");
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProgram = useMemo(
    () => catalog.find((program) => program.id === formState.programId),
    [catalog, formState.programId]
  );
  const semesters = useMemo(() => selectedProgram?.semesters ?? [], [selectedProgram]);
  const selectedSemester = useMemo(
    () => semesters.find((semester) => semester.id === formState.semesterId),
    [semesters, formState.semesterId]
  );
  const sections = selectedSemester?.sections ?? [];
  const subjects = selectedSemester?.subjects ?? [];
  const selectedSection = sections.find((section) => section.id === formState.sectionId);
  const selectedSubject = subjects.find((subject) => subject.id === formState.subjectId);

  function handleChange(field: keyof typeof initialState, value: string) {
    setSubmittedMessage("");
    setFormState((current) => {
      if (field === "programId") {
        return {
          ...current,
          programId: value,
          semesterId: "",
          sectionId: "",
          subjectId: ""
        };
      }

      if (field === "semesterId") {
        return {
          ...current,
          semesterId: value,
          sectionId: "",
          subjectId: ""
        };
      }

      return {
        ...current,
        [field]: value
      };
    });
  }

  const selectedProgramName = selectedProgram?.name ?? "";
  const selectedSemesterName = selectedSemester?.name ?? "";
  const selectedSectionName = selectedSection?.name ?? "";
  const selectedSubjectName = selectedSubject?.name ?? "";

  const previewLine =
    selectedProgramName && selectedSemesterName && selectedSectionName && selectedSubjectName
      ? `${selectedProgramName} / ${selectedSemesterName} / ${selectedSectionName} / ${selectedSubjectName}`
      : "Choose class details to unlock the final subject list.";

  return (
    <form
      className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!selectedProgram || !selectedSemester || !selectedSection || !selectedSubject) {
          return;
        }

        setSubmitting(true);
        setSubmittedMessage("");

        const response = await fetch("/api/logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            teacherId: "t1",
            teacherName: "Dr. Meera Nair",
            program: selectedProgram.name,
            semester: selectedSemester.name,
            subject: selectedSubject.name,
            section: selectedSection.name,
            startTime: formState.startTime,
            endTime: formState.endTime,
            methodology: formState.methodology,
            topic: formState.topic,
            notes: formState.notes,
            date: formState.date
          })
        });

        const payload = (await response.json()) as { source?: string };
        setSubmittedMessage(
          payload.source === "supabase"
            ? "Daily log saved to Supabase."
            : "Daily log saved with local development fallback."
        );
        setSubmitting(false);
      }}
    >
      <div className="space-y-6">
        <div className="glass-panel rounded-[1.9rem] p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-500">Daily Entry</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-800">Teaching Session Details</h3>
            </div>
            <div className="glass-panel w-full rounded-[1.25rem] px-4 py-3 text-sm text-slate-600 lg:w-auto">{status}</div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <FieldShell label="Program / Class" helper="Admin-managed academic programs">
              <select
                required
                className="apple-input px-4 py-4 text-sm"
                value={formState.programId}
                onChange={(event) => handleChange("programId", event.target.value)}
              >
                <option value="">Select a program</option>
                {catalog.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label="Semester" helper="Filtered by the selected program">
              <select
                required
                disabled={!selectedProgram}
                className="apple-input px-4 py-4 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
                value={formState.semesterId}
                onChange={(event) => handleChange("semesterId", event.target.value)}
              >
                <option value="">{selectedProgram ? "Select a semester" : "Select a program first"}</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label="Section" helper="Filtered by the selected semester">
              <select
                required
                disabled={!selectedSemester}
                className="apple-input px-4 py-4 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
                value={formState.sectionId}
                onChange={(event) => handleChange("sectionId", event.target.value)}
              >
                <option value="">{selectedSemester ? "Select a section" : "Select a semester first"}</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label="Subject" helper="Only available semester subjects are shown">
              <select
                required
                disabled={!selectedSemester}
                className="apple-input px-4 py-4 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
                value={formState.subjectId}
                onChange={(event) => handleChange("subjectId", event.target.value)}
              >
                <option value="">{selectedSemester ? "Select a subject" : "Select a semester first"}</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </FieldShell>
          </div>
        </div>

        <div className="glass-panel rounded-[1.9rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Session Metadata</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <FieldShell label="Start Time">
              <input
                required
                type="time"
                className="apple-input px-4 py-4 text-sm"
                value={formState.startTime}
                onChange={(event) => handleChange("startTime", event.target.value)}
              />
            </FieldShell>

            <FieldShell label="End Time">
              <input
                required
                type="time"
                className="apple-input px-4 py-4 text-sm"
                value={formState.endTime}
                onChange={(event) => handleChange("endTime", event.target.value)}
              />
            </FieldShell>

            <FieldShell label="Teaching Methodology">
              <select
                required
                className="apple-input px-4 py-4 text-sm"
                value={formState.methodology}
                onChange={(event) => handleChange("methodology", event.target.value)}
              >
                <option value="">Select methodology</option>
                {teachingMethodologies.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldShell label="Date">
              <input
                required
                type="date"
                className="apple-input px-4 py-4 text-sm"
                value={formState.date}
                onChange={(event) => handleChange("date", event.target.value)}
              />
            </FieldShell>

            <FieldShell label="Topic Covered" helper="What exactly happened in the session">
              <input
                required
                type="text"
                className="apple-input px-4 py-4 text-sm"
                placeholder="Process scheduling algorithms"
                value={formState.topic}
                onChange={(event) => handleChange("topic", event.target.value)}
              />
            </FieldShell>
          </div>

          <div className="mt-4">
            <FieldShell label="Notes (Optional)" helper="Add follow-up work, class response, or attendance context">
              <textarea
                className="apple-input min-h-32 px-4 py-4 text-sm"
                placeholder="Students needed another example for starvation and priority inversion."
                value={formState.notes}
                onChange={(event) => handleChange("notes", event.target.value)}
              />
            </FieldShell>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[2rem] bg-slate-800 p-6 text-white soft-ring">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Resolved Teaching Slot</p>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.05em]">{previewLine}</p>
          <p className="mt-4 text-sm leading-7 text-white/75">
            This keeps the teacher flow strict and clean: program decides semester, semester decides section and subject.
          </p>
        </div>

        <div className="glass-panel rounded-[1.9rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Submission State</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-[1.4rem] bg-white/70 p-4">
              <p className="text-sm font-medium text-slate-700">Teacher</p>
              <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-800">Dr. Meera Nair</p>
            </div>
            <div className="rounded-[1.4rem] bg-white/70 p-4">
              <p className="text-sm font-medium text-slate-700">Database Path</p>
              <p className="mt-1 text-sm leading-7 text-slate-600">
                Form submissions go to `/api/logs`. If Supabase keys are configured, records persist there. Otherwise they fall back to the local in-memory development store.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-[1.25rem] bg-slate-800 px-5 py-4 text-sm font-semibold text-white"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Saving..." : "Submit Daily Log"}
            </button>
            <button
              className="rounded-[1.25rem] border border-slate-300/70 bg-white/70 px-5 py-4 text-sm font-semibold text-slate-700"
              type="button"
              onClick={() => {
                setFormState(initialState);
                setSubmittedMessage("");
              }}
            >
              Reset Form
            </button>
          </div>

          {submittedMessage ? (
            <p className="mt-4 text-sm font-medium text-emerald-700">{submittedMessage}</p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
