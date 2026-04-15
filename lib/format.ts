export function formatHours(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const totalMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);

  return `${(totalMinutes / 60).toFixed(1)} hrs`;
}

export function scoreTone(score: number) {
  if (score >= 85) {
    return "text-emerald-700 bg-emerald-50";
  }

  if (score >= 70) {
    return "text-amber-700 bg-amber-50";
  }

  return "text-rose-700 bg-rose-50";
}
