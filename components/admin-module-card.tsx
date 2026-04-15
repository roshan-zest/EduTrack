import Link from "next/link";

type AdminModuleCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  accent?: string;
};

export function AdminModuleCard({
  eyebrow,
  title,
  description,
  href,
  accent = "from-sky-500/20 to-indigo-500/10"
}: AdminModuleCardProps) {
  return (
    <Link href={href} className={`glass-panel-strong card-hover rounded-[1.9rem] bg-gradient-to-br ${accent} p-6`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{eyebrow}</p>
        <div className="rounded-full bg-white/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Open
        </div>
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-800">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-800">
        Enter module
        <span className="text-slate-400">→</span>
      </div>
    </Link>
  );
}
