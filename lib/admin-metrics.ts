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
}

export function countUniqueTeachers(logs: TeachingLog[]) {
  return new Set(logs.map((entry) => entry.teacherId)).size;
}

export function buildMethodologyDistribution(logs: TeachingLog[]) {
  const counts = new Map<string, number>();

  for (const entry of logs) {
    counts.set(entry.methodology, (counts.get(entry.methodology) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 6);
}

export function buildActivityTrend(logs: TeachingLog[]) {
  if (!logs.length) {
    return [
      { label: "Week 1", classes: 0, hours: 0 },
      { label: "Week 2", classes: 0, hours: 0 },
      { label: "Week 3", classes: 0, hours: 0 },
      { label: "Week 4", classes: 0, hours: 0 }
    ];
  }

  const sortedDates = logs
    .map((entry) => new Date(entry.date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((left, right) => left.getTime() - right.getTime());
  const latestDate = sortedDates[sortedDates.length - 1] ?? new Date();
  const weekBuckets = [0, 1, 2, 3].map((weekIndex) => {
    const start = new Date(latestDate);
    start.setDate(start.getDate() - (3 - weekIndex) * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return { start, end };
  });

  return weekBuckets.map((bucket, index) => {
    const bucketLogs = logs.filter((entry) => {
      const entryDate = new Date(entry.date);
      return !Number.isNaN(entryDate.getTime()) && entryDate >= bucket.start && entryDate < bucket.end;
    });

    return {
      label: `Week ${index + 1}`,
      classes: bucketLogs.length,
      hours: Number(bucketLogs.reduce((sum, entry) => sum + durationHours(entry.startTime, entry.endTime), 0).toFixed(1))
    };
  });
}
