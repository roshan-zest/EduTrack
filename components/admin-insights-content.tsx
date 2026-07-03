"use client";

import { useMemo, useState } from "react";
import { ActivityTrendChart, MethodologyChart, WorkloadChart } from "@/components/charts";
import { StatCard } from "@/components/stat-card";
import { ExportButton } from "@/components/export-button";
import { buildActivityTrend, buildMethodologyDistribution, durationHours } from "@/lib/admin-metrics";
import { TeachingLog, Teacher } from "@/lib/types";

type AdminInsightsContentProps = {
  teachingLogs: TeachingLog[];
  teachers: Teacher[];
};

function resolveLogDepartment(log: TeachingLog, activeTeachers: Teacher[]) {
  const matchedTeacher = activeTeachers.find(
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

function buildTeacherHours(logs: TeachingLog[]) {
  const hours: Record<string, number> = {};

  logs.forEach((log) => {
    const teacherName = log.teacherName;
    const duration = durationHours(log.startTime, log.endTime);

    hours[teacherName] = (hours[teacherName] ?? 0) + duration;
  });

  return Object.entries(hours)
    .map(([name, hours]) => ({
      name: name.split(" ")[1] ?? name,
      hours: Number(hours.toFixed(1))
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 6);
}

export function AdminInsightsContent({ teachingLogs, teachers }: AdminInsightsContentProps) {
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");

  const departmentOptions = useMemo(() => {
    const teacherDepartments = teachers
      .filter((entry) => entry.role === "teacher")
      .map((entry) => entry.department);
    const logDepartments = teachingLogs.map((log) => resolveLogDepartment(log, teachers));

    return [
      "All Departments",
      ...Array.from(new Set([...teacherDepartments, ...logDepartments])).sort((a, b) => a.localeCompare(b))
    ];
  }, [teachingLogs, teachers]);

  const filteredLogs = useMemo(() => {
    if (selectedDepartment === "All Departments") {
      return teachingLogs;
    }

    return teachingLogs.filter((entry) => resolveLogDepartment(entry, teachers) === selectedDepartment);
  }, [selectedDepartment, teachingLogs, teachers]);

  const totalHours = useMemo(() => {
    return filteredLogs.reduce((sum, entry) => sum + durationHours(entry.startTime, entry.endTime), 0);
  }, [filteredLogs]);

  const teacherCount = useMemo(() => {
    return new Set(filteredLogs.map((entry) => entry.teacherId)).size;
  }, [filteredLogs]);

  const chartData = useMemo(() => {
    return buildTeacherHours(filteredLogs);
  }, [filteredLogs]);

  const methodologyDistribution = useMemo(() => {
    return buildMethodologyDistribution(filteredLogs);
  }, [filteredLogs]);

  const activityTrend = useMemo(() => {
    return buildActivityTrend(filteredLogs);
  }, [filteredLogs]);

  return (
    <>
      <section className="mb-8 flex flex-col gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-600">Filter Analytics by Department</p>
          <h2 className="mt-2 text-lg font-bold tracking-[-0.03em] text-slate-900">Select Department to View Insights</h2>
          <p className="mt-1 text-xs text-slate-600">All metrics and charts update in real-time</p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
          <div className="w-full sm:w-[320px]">
            <select
              value={selectedDepartment}
              onChange={(event) => setSelectedDepartment(event.target.value)}
              className="apple-input w-full rounded-lg border-2 border-indigo-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition-all hover:border-indigo-400 focus:border-indigo-500"
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

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        <StatCard
          label="Hours Tracked"
          value={`${totalHours.toFixed(1)} hrs`}
          caption="Calculated from teaching logs in the current feed"
          tone="primary"
          icon="↗"
          trend={selectedDepartment === "All Departments" ? "All departments" : selectedDepartment}
        />
        <StatCard
          label="Teachers in Charts"
          value={String(teacherCount)}
          caption="Faculty members represented in workload analytics"
          tone="neutral"
          icon="◉"
          trend="Coverage map"
        />
        <StatCard
          label="Classes Logged"
          value={String(filteredLogs.length)}
          caption="Teaching sessions in the current filtered view"
          tone="success"
          icon="▣"
          trend="Live from logs"
        />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <WorkloadChart data={chartData} />
        <MethodologyChart data={methodologyDistribution} />
        <ActivityTrendChart data={activityTrend} />
      </section>
    </>
  );
}
