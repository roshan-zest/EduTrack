"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCatalog, getDefaultCatalog, saveCatalog } from "@/lib/catalog";
import { CurriculumCatalog } from "@/lib/types";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function SelectField({
  value,
  onChange,
  children
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      className="apple-input w-full px-4 py-4 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {children}
    </select>
  );
}

function QuickActionCard({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel-strong rounded-[1.6rem] p-5">
      <p className="text-xl font-semibold tracking-[-0.03em] text-slate-800">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function AdminCurriculumManager() {
  const [catalog, setCatalog] = useState<CurriculumCatalog>([]);
  const [programId, setProgramId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [programName, setProgramName] = useState("");
  const [semesterName, setSemesterName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [status, setStatus] = useState("Loading catalog...");
  const [saving, setSaving] = useState(false);
  const [editingProgram, setEditingProgram] = useState(false);
  const [editingSemester, setEditingSemester] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editProgramName, setEditProgramName] = useState("");
  const [editSemesterName, setEditSemesterName] = useState("");
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editSubjectCode, setEditSubjectCode] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      const payload = await fetchCatalog();
      if (cancelled) {
        return;
      }

      setCatalog(payload.data);
      setProgramId(payload.data[0]?.id ?? "");
      setSemesterId(payload.data[0]?.semesters[0]?.id ?? "");
      setStatus(payload.source === "supabase" ? "Connected to Supabase" : "Using local fallback storage");
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProgram = useMemo(
    () => catalog.find((program) => program.id === programId),
    [catalog, programId]
  );
  const selectedSemester = useMemo(
    () => selectedProgram?.semesters.find((semester) => semester.id === semesterId),
    [selectedProgram, semesterId]
  );

  const selectedProgramSemesterCount = selectedProgram?.semesters.length ?? 0;
  const selectedSemesterSectionCount = selectedSemester?.sections.length ?? 0;
  const selectedSemesterSubjectCount = selectedSemester?.subjects.length ?? 0;

  useEffect(() => {
    setEditProgramName(selectedProgram?.name ?? "");
  }, [selectedProgram]);

  useEffect(() => {
    setEditSemesterName(selectedSemester?.name ?? "");
  }, [selectedSemester]);

  async function persist(nextCatalog: CurriculumCatalog) {
    setSaving(true);
    const payload = await saveCatalog(nextCatalog);
    setCatalog(payload.data);
    setStatus(payload.source === "supabase" ? "Saved to Supabase" : "Saved locally until DB is configured");
    setSaving(false);
  }

  return (
    <div className="glass-panel rounded-[2rem] p-6 md:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-500">Admin Controls</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-800">Curriculum Catalog Manager</h3>
          <p className="mt-3 text-sm leading-7 text-slate-500 md:text-base">
            Manage academic structure in one place. Pick a program and semester, review what already exists, then add or edit entries without the layout fighting you.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="glass-panel rounded-[1.25rem] px-4 py-3 text-sm text-slate-600">{status}</div>
          <button
            type="button"
            className="rounded-[1.25rem] border border-slate-300/70 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            onClick={async () => {
              const defaults = getDefaultCatalog();
              await persist(defaults);
              setProgramId(defaults[0]?.id ?? "");
              setSemesterId(defaults[0]?.semesters[0]?.id ?? "");
            }}
          >
            Reset Catalog
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <div className="glass-panel-strong rounded-[1.75rem] p-5">
            <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Focus Area</p>
                  <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
                    {selectedProgram?.name ?? "Select a program"}
                  </h4>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Use this section to choose which academic path you are editing.
                  </p>
                </div>
                <div className="glass-panel rounded-[1.2rem] px-4 py-3 text-sm text-slate-600">
                  {selectedSemester?.name ?? "Choose a semester"}
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <SelectField
                  value={programId}
                  onChange={(nextProgramId) => {
                    const program = catalog.find((item) => item.id === nextProgramId);
                    setProgramId(nextProgramId);
                    setSemesterId(program?.semesters[0]?.id ?? "");
                  }}
                >
                  {catalog.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </SelectField>

                <SelectField value={semesterId} onChange={setSemesterId}>
                  {(selectedProgram?.semesters ?? []).map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.35rem] bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Semesters</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">{selectedProgramSemesterCount}</p>
                <p className="mt-1 text-sm text-slate-500">In this program</p>
              </div>
              <div className="rounded-[1.35rem] bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Sections</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">{selectedSemesterSectionCount}</p>
                <p className="mt-1 text-sm text-slate-500">In this semester</p>
              </div>
              <div className="rounded-[1.35rem] bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Subjects</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">{selectedSemesterSubjectCount}</p>
                <p className="mt-1 text-sm text-slate-500">Available to teachers</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Quick Actions</p>
            <h4 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-800">Expand the structure</h4>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <QuickActionCard
                title="Add a program"
                description="Create a new top-level course before attaching semesters and subjects to it."
              >
                <div className="space-y-3">
                  <input
                    className="apple-input w-full px-4 py-4 text-sm"
                    placeholder="BBA"
                    value={programName}
                    onChange={(event) => setProgramName(event.target.value)}
                  />
                  <button
                    type="button"
                    className="w-full rounded-[1.25rem] bg-slate-800 px-5 py-4 text-sm font-semibold text-white"
                    onClick={async () => {
                      if (!programName.trim()) {
                        return;
                      }

                      const nextProgram = {
                        id: createId("prog"),
                        name: programName.trim(),
                        semesters: []
                      };
                      const nextCatalog = [...catalog, nextProgram];
                      await persist(nextCatalog);
                      setProgramId(nextProgram.id);
                      setSemesterId("");
                      setProgramName("");
                    }}
                  >
                    Add
                  </button>
                </div>
              </QuickActionCard>

              <QuickActionCard
                title="Add a semester"
                description="Attach a semester to the selected program so sections and subjects can be mapped."
              >
                <div className="space-y-3">
                  <input
                    className="apple-input w-full px-4 py-4 text-sm"
                    placeholder="Semester 1"
                    value={semesterName}
                    onChange={(event) => setSemesterName(event.target.value)}
                  />
                  <button
                    type="button"
                    disabled={!selectedProgram}
                    className="w-full rounded-[1.25rem] bg-slate-800 px-5 py-4 text-sm font-semibold text-white disabled:bg-slate-300"
                    onClick={async () => {
                      if (!selectedProgram || !semesterName.trim()) {
                        return;
                      }

                      const nextSemester = {
                        id: createId("sem"),
                        name: semesterName.trim(),
                        sections: [],
                        subjects: []
                      };

                      const nextCatalog = catalog.map((program) =>
                        program.id === selectedProgram.id
                          ? { ...program, semesters: [...program.semesters, nextSemester] }
                          : program
                      );

                      await persist(nextCatalog);
                      setSemesterId(nextSemester.id);
                      setSemesterName("");
                    }}
                  >
                    Add
                  </button>
                </div>
              </QuickActionCard>

              <QuickActionCard
                title="Add a section"
                description="Sections belong to the active semester and appear directly in the teacher log form."
              >
                <div className="space-y-3">
                  <input
                    className="apple-input w-full px-4 py-4 text-sm"
                    placeholder="Section C"
                    value={sectionName}
                    onChange={(event) => setSectionName(event.target.value)}
                  />
                  <button
                    type="button"
                    disabled={!selectedSemester}
                    className="w-full rounded-[1.25rem] bg-slate-800 px-5 py-4 text-sm font-semibold text-white disabled:bg-slate-300"
                    onClick={async () => {
                      if (!selectedSemester || !sectionName.trim()) {
                        return;
                      }

                      const nextCatalog = catalog.map((program) => ({
                        ...program,
                        semesters: program.semesters.map((semester) =>
                          semester.id === selectedSemester.id
                            ? {
                                ...semester,
                                sections: [...semester.sections, { id: createId("section"), name: sectionName.trim() }]
                              }
                            : semester
                        )
                      }));

                      await persist(nextCatalog);
                      setSectionName("");
                    }}
                  >
                    Add
                  </button>
                </div>
              </QuickActionCard>
            </div>
          </div>
        </div>

        <div className="space-y-5 2xl:sticky 2xl:top-6 2xl:self-start">
          <div className="glass-panel-strong rounded-[1.75rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Current Semester View</p>
            <div className="mt-3 space-y-4">
              <div className="rounded-[1.4rem] bg-white/70 p-4">
                {editingProgram ? (
                  <div className="flex flex-col gap-3 lg:flex-row">
                    <input
                      className="apple-input min-w-0 flex-1 px-4 py-3 text-sm"
                      value={editProgramName}
                      onChange={(event) => setEditProgramName(event.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-[1rem] bg-slate-800 px-4 py-3 text-sm font-semibold text-white"
                        onClick={async () => {
                          if (!selectedProgram || !editProgramName.trim()) {
                            return;
                          }

                          const nextCatalog = catalog.map((program) =>
                            program.id === selectedProgram.id ? { ...program, name: editProgramName.trim() } : program
                          );
                          await persist(nextCatalog);
                          setEditingProgram(false);
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="rounded-[1rem] border border-slate-300 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700"
                        onClick={() => {
                          setEditingProgram(false);
                          setEditProgramName(selectedProgram?.name ?? "");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-3xl font-semibold tracking-[-0.05em] text-slate-800">
                      {selectedProgram?.name ?? "No program selected"}
                    </h4>
                    <button
                      type="button"
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                      onClick={() => setEditingProgram(true)}
                    >
                      Edit Course
                    </button>
                  </div>
                )}

                <div className="mt-3">
                  {editingSemester ? (
                    <div className="flex flex-col gap-3 lg:flex-row">
                      <input
                        className="apple-input min-w-0 flex-1 px-4 py-3 text-sm"
                        value={editSemesterName}
                        onChange={(event) => setEditSemesterName(event.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-[1rem] bg-slate-800 px-4 py-3 text-sm font-semibold text-white"
                          onClick={async () => {
                            if (!selectedSemester || !editSemesterName.trim()) {
                              return;
                            }

                            const nextCatalog = catalog.map((program) => ({
                              ...program,
                              semesters: program.semesters.map((semester) =>
                                semester.id === selectedSemester.id
                                  ? { ...semester, name: editSemesterName.trim() }
                                  : semester
                              )
                            }));
                            await persist(nextCatalog);
                            setEditingSemester(false);
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="rounded-[1rem] border border-slate-300 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700"
                          onClick={() => {
                            setEditingSemester(false);
                            setEditSemesterName(selectedSemester?.name ?? "");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-base text-slate-500">
                        {selectedSemester?.name ?? "Select a semester to inspect its structure."}
                      </p>
                      {selectedSemester ? (
                        <button
                          type="button"
                          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                          onClick={() => setEditingSemester(true)}
                        >
                          Edit Semester
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
                <div className="rounded-[1.4rem] bg-white/70 p-5">
                  <p className="text-sm font-semibold text-slate-700">Sections</p>
                  <div className="mt-4 max-h-44 overflow-y-auto pr-1">
                    <div className="flex flex-wrap gap-2">
                    {(selectedSemester?.sections ?? []).map((section) => (
                      <span key={section.id} className="rounded-full bg-slate-100 px-4 py-2.5 text-sm text-slate-600">
                        {section.name}
                      </span>
                    ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.4rem] bg-white/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700">Subjects</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      {selectedSemesterSubjectCount} active
                    </p>
                  </div>
                  <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
                    {(selectedSemester?.subjects ?? []).map((subject) => (
                      <div key={subject.id} className="rounded-[1.15rem] bg-slate-100 px-4 py-3 text-sm text-slate-600">
                        {editingSubjectId === subject.id ? (
                          <div className="space-y-3">
                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px]">
                              <input
                                className="apple-input w-full px-4 py-3 text-sm"
                                value={editSubjectName}
                                onChange={(event) => setEditSubjectName(event.target.value)}
                              />
                              <input
                                className="apple-input w-full px-4 py-3 text-sm"
                                value={editSubjectCode}
                                onChange={(event) => setEditSubjectCode(event.target.value)}
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="rounded-[1rem] bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
                                onClick={async () => {
                                  if (!selectedSemester || !editSubjectName.trim() || !editSubjectCode.trim()) {
                                    return;
                                  }

                                  const nextCatalog = catalog.map((program) => ({
                                    ...program,
                                    semesters: program.semesters.map((semester) =>
                                      semester.id === selectedSemester.id
                                        ? {
                                            ...semester,
                                            subjects: semester.subjects.map((item) =>
                                              item.id === subject.id
                                                ? {
                                                    ...item,
                                                    name: editSubjectName.trim(),
                                                    code: editSubjectCode.trim().toUpperCase()
                                                  }
                                                : item
                                            )
                                          }
                                        : semester
                                    )
                                  }));
                                  await persist(nextCatalog);
                                  setEditingSubjectId(null);
                                }}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="rounded-[1rem] border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                                onClick={() => setEditingSubjectId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium text-slate-700">{subject.name}</div>
                              <div className="mt-1 text-slate-400">{subject.code}</div>
                            </div>
                            <button
                              type="button"
                              className="shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                              onClick={() => {
                                setEditingSubjectId(subject.id);
                                setEditSubjectName(subject.name);
                                setEditSubjectCode(subject.code);
                              }}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel-strong rounded-[1.75rem] p-6">
            <div className="flex flex-col gap-3 border-b border-slate-200/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Subject Manager</p>
                <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">Add a subject</h4>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Add subjects from the bottom of the workflow so the overview stays clean and the inputs always have room.
                </p>
              </div>
              <div className="text-sm text-slate-500">
                {selectedSemester ? `Adding to ${selectedSemester.name}` : "Select a semester first"}
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_auto]">
              <input
                className="apple-input px-4 py-4 text-sm"
                placeholder="Cloud Computing"
                value={subjectName}
                onChange={(event) => setSubjectName(event.target.value)}
              />
              <input
                className="apple-input px-4 py-4 text-sm"
                placeholder="CSE601"
                value={subjectCode}
                onChange={(event) => setSubjectCode(event.target.value)}
              />
              <button
                type="button"
                disabled={!selectedSemester}
                className="rounded-[1.25rem] bg-slate-800 px-5 py-4 text-sm font-semibold text-white disabled:bg-slate-300"
                onClick={async () => {
                  if (!selectedSemester || !subjectName.trim() || !subjectCode.trim()) {
                    return;
                  }

                  const nextCatalog = catalog.map((program) => ({
                    ...program,
                    semesters: program.semesters.map((semester) =>
                      semester.id === selectedSemester.id
                        ? {
                            ...semester,
                            subjects: [
                              ...semester.subjects,
                              {
                                id: createId("subject"),
                                name: subjectName.trim(),
                                code: subjectCode.trim().toUpperCase()
                              }
                            ]
                          }
                        : semester
                    )
                  }));

                  await persist(nextCatalog);
                  setSubjectName("");
                  setSubjectCode("");
                }}
              >
                Add Subject
              </button>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-slate-800 px-5 py-4 text-sm text-white/75 soft-ring">
            If Supabase keys are present, changes persist to the database. If not, the app still works using the local development fallback.
          </div>
        </div>
      </div>
    </div>
  );
}
