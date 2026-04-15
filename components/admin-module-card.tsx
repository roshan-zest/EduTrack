import Link from "next/link";

type AdminModuleCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
};

export function AdminModuleCard({ eyebrow, title, description, href }: AdminModuleCardProps) {
  return (
    <Link href={href} className="glass-panel-strong rounded-[1.75rem] p-6 transition hover:bg-white/95">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">{eyebrow}</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-800">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
      <p className="mt-5 text-sm font-semibold text-slate-800">Open module</p>
    </Link>
  );
}
