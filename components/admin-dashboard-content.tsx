"use client";

import { useMemo, useState } from "react";
import { ActivityTrendChart, MethodologyChart, WorkloadChart } from "@/components/charts";
import { AdminModuleCard } from "@/components/admin-module-card";
import { StatCard } from "@/components/stat-card";
import { ExportButton } from "@/components/export-button";
import { buildActivityTrend, buildMethodologyDistribution, durationHours } from "@/lib/admin-metrics";
import { teachers } from "@/lib/mock-data";
import { TeachingLog } from "@/lib/types";

type AdminDashboardContentProps = {
  teachingLogs: TeachingLog[];
};

function resolveLogDepartment(log: TeachingLog) {
  const matchedTeacher = teachers.find(
    (entry) =>
      entry.id === log.teacherId ||
      entry.name.toLowerCase() === log.teacherName.toLowerCase()
  );

  if (matchedTeacher) {
    return matchedTeacher.department;
  }

  if (log.program.toLowerCase().includes("bca")) {
    return "BCA";
  }

  if (log.program.toLowerCase().includes("cse")) {
    return "Computer Science";
  }

  if (log.program.toLowerCase().includes("ece")) {
    return "Electronics";
  }

  return "Other";
}

export function AdminDashboardContent({ teachingLogs }: AdminDashboardContentProps) {
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");

  const departmentOptions = useMemo(() => {
    const teacherDepartments = teachers
      .filter((entry) => entry.role === "teacher")
      .map((entry) => entry.department);
    const logDepartments = teachingLogs.map(resolveLogDepartment);

    return [
      "All Departments",
      ...Array.from(new Set([...teacherDepartments, ...logDepartments])).sort((a, b) => a.localeCompare(b))
    ];
  }, [teachingLogs]);

  const filteredLogs = useMemo(() => {
    if (selectedDepartment === "All Departments") {
      return teachingLogs;
    }

    return teachingLogs.filter((entry) => resolveLogDepartment(entry) === selectedDepartment);
  }, [selectedDepartment, teachingLogs]);

  const teacherPool = useMemo(() => {
    const onlyTeachers = teachers.filter((entry) => entry.role === "teacher");

    if (selectedDepartment === "All Departments") {
      return onlyTeachers;
    }

    return onlyTeachers.filter((entry) => entry.department === selectedDepartment);
  }, [selectedDepartment]);

  const workloadData = useMemo(() => {
    return teacherPool.map((teacher) => {
      const teacherHours = filteredLogs
        .filter(
          (entry) =>
            entry.teacherId === teacher.id ||
            entry.teacherName.toLowerCase() === teacher.name.toLowerCase()
        )
        .reduce((sum, entry) => sum + durationHours(entry.startTime, entry.endTime), 0);

      return {
        name: teacher.name.split(" ")[1] ?? teacher.name,
        hours: Number(teacherHours.toFixed(1))
      };
    });
  }, [filteredLogs, teacherPool]);

  const totalHours = filteredLogs.reduce((sum, entry) => sum + durationHours(entry.startTime, entry.endTime), 0);
  const activeTeacherCount = new Set(filteredLogs.map((entry) => entry.teacherId)).size;
  const methodologyDistribution = buildMethodologyDistribution(filteredLogs);
  const activityTrend = buildActivityTrend(filteredLogs);

  return (
    <>
      <section className="mb-8 flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-600">Filter by Department</p>
          <h2 className="mt-2 text-lg font-bold tracking-[-0.03em] text-slate-900">Select a Department to View Analytics</h2>
          <p className="mt-1 text-xs text-slate-600">Charts and stats update instantly based on your selection</p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
          <div className="w-full sm:w-[320px]">
            <select
              value={selectedDepartment}
              onChange={(event) => setSelectedDepartment(event.target.value)}
              className="apple-input w-full rounded-lg border-2 border-blue-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition-all hover:border-blue-400 focus:border-blue-500"
            >
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <ExportButton logs={filteredLogs} department={selectedDepartment} />
        </div>
      </section>

      <section className="mt-7 md:mt-8">
        <div className="mb-4 md:mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Performance Analytics</p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-slate-900 md:text-2xl">Live Teaching Metrics</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Teachers"
          value={String(activeTeacherCount)}
          caption="Faculty members currently active in the selected view"
          tone="primary"
          icon="◉"
          trend={selectedDepartment === "All Departments" ? "All departments" : selectedDepartment}
          href="/admin/teachers"
        />
        <StatCard
          label="Classes Conducted"
          value={String(filteredLogs.length)}
          caption="Teaching logs for the selected department filter"
          tone="neutral"
          icon="▮"
          trend="Updated live"
        />
        <StatCard
          label="Total Hours Taught"
          value={`${totalHours.toFixed(1)} hrs`}
          caption="Instructional time tracked for this filtered view"
          tone="success"
          icon="↗"
          trend="Coverage"
        />
        </div>

        <div className="mt-7 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          <WorkloadChart data={workloadData} />
          <MethodologyChart data={methodologyDistribution} />
          <ActivityTrendChart data={activityTrend} />
        </div>
      </section>

      <section className="mt-7 md:mt-8">
        <div className="mb-4 md:mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Organized Modules</p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-slate-900 md:text-2xl">System Management</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          <AdminModuleCard
            eyebrow="Faculty"
            title="Teacher Directory"
            description="Browse all faculty, view teaching sessions, track hours, and monitor activity per teacher."
            href="/admin/teachers"
            accent="from-blue-500/12 via-white to-cyan-500/8"
          />
          <AdminModuleCard
            eyebrow="Requests"
            title="Registration Requests"
            description="Review pending teacher registrations, approve with role assignment, and manage access requests."
            href="/admin/access"
            accent="from-amber-500/14 via-white to-orange-500/10"
          />
          <AdminModuleCard
            eyebrow="Curriculum"
            title="Curriculum Manager"
            description="Control programs, semesters, sections, and subjects in a dedicated workspace with inline editing."
            href="/admin/curriculum"
            accent="from-sky-500/18 via-white to-indigo-500/8"
          />
          <AdminModuleCard
            eyebrow="Activity"
            title="Teaching Activity"
            description="Inspect all faculty logs, review activity patterns, and monitor teaching methodology distribution."
            href="/admin/activity"
            accent="from-emerald-500/14 via-white to-sky-500/8"
          />
          <AdminModuleCard
            eyebrow="Analytics"
            title="Insights & Reports"
            description="Track teaching hour distribution, methodology patterns, activity trends, and system metrics."
            href="/admin/insights"
            accent="from-violet-500/16 via-white to-pink-500/10"
          />
        </div>
      </section>

    </>
  );
}
