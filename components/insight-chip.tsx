import { scoreTone } from "@/lib/format";

type InsightChipProps = {
  label: string;
  value: number;
};

export function InsightChip({ label, value }: InsightChipProps) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${scoreTone(value)}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}%</p>
    </div>
  );
}
