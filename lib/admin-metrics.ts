import { TeachingLog } from "@/lib/types";
import { teachers } from "@/lib/mock-data";

export function durationHours(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
}

export function buildTeacherHours(logs: TeachingLog[]) {
  const teacherOnly = teachers.filter((entry) => entry.role === "teacher");

  return teacherOnly.map((teacher) => {
    const teacherHours = logs
      .filter((entry) => entry.teacherId === teacher.id)
      .reduce((sum, entry) => sum + durationHours(entry.startTime, entry.endTime), 0);

    return {
      name: teacher.name.split(" ")[1] ?? teacher.name,
      hours: Number(teacherHours.toFixed(1))
    };
  });
}
