import { scoreTone } from "@/lib/format";

type InsightChipProps = {
  label: string;
  value: number;
};

export function InsightChip({ label, value }: InsightChipProps) {
  const tone = scoreTone(value);

  return (
    <div className={`card-hover rounded-[1.45rem] border px-4 py-4 transition-colors hover:brightness-105 ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em]">{label}</p>
        <span className="text-xs font-semibold">{value >= 85 ? "↑" : value >= 70 ? "→" : "↓"}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{value}%</p>
    </div>
  );
}
