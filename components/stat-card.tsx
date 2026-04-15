type StatCardProps = {
  label: string;
  value: string;
  caption: string;
};

export function StatCard({ label, value, caption }: StatCardProps) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">{label}</p>
      <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-800">{value}</p>
      <p className="mt-3 max-w-xs text-sm leading-7 text-slate-500">{caption}</p>
    </div>
  );
}
