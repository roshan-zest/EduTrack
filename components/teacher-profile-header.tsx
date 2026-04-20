'use client';

import { useEffect, useState } from "react";
import { Teacher } from "@/lib/types";

interface TeacherProfileHeaderProps {
  initialTeacher: Teacher;
}

export function TeacherProfileHeader({ initialTeacher }: TeacherProfileHeaderProps) {
  const [teacher, setTeacher] = useState<Teacher>(initialTeacher);

  useEffect(() => {
    // Check localStorage for updated teacher data
    const updatedTeachersStr = localStorage.getItem('edutrack_teachers');
    if (updatedTeachersStr) {
      try {
        const updatedTeachers = JSON.parse(updatedTeachersStr);
        if (updatedTeachers[initialTeacher.id]) {
          setTeacher(updatedTeachers[initialTeacher.id]);
        }
      } catch (e) {
        // If JSON parsing fails, use initial teacher
      }
    }
  }, [initialTeacher.id, initialTeacher]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">{teacher.name}</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
            teacher.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"
          }`}
        >
          {teacher.role}
        </span>
      </div>
      <p className="mt-1 text-base text-slate-600">
        {teacher.email} • {teacher.department} Department
      </p>
    </div>
  );
}
