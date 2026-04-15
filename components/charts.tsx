"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Area,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const pieColors = ["#1d3557", "#d97757", "#5f6caf", "#7dbb91"];

function ChartTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{ color?: string; dataKey?: string; value?: number | string; name?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-[1rem] border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
      {label ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p> : null}
      <div className="mt-2 space-y-1.5">
        {payload.map((item) => (
          <div key={`${item.dataKey}-${item.name}`} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-medium text-slate-700">{item.name ?? item.dataKey}</span>
            <span className="text-slate-400">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkloadChart({
  data
}: {
  data: { name: string; hours: number }[];
}) {
  return (
    <div className="chart-shell h-80 rounded-[1.85rem] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tracking-[-0.02em] text-slate-600">Teaching Hours Per Teacher</p>
        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Workload
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <defs>
            <linearGradient id="workloadBar" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#4f8df7" />
              <stop offset="100%" stopColor="#22385f" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8e2ee" />
          <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} />
          <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
          <Bar dataKey="hours" radius={[14, 14, 6, 6]} fill="url(#workloadBar)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MethodologyChart({
  data
}: {
  data: { name: string; value: number }[];
}) {
  const radialData = data.map((item, index) => ({
    ...item,
    fill: pieColors[index % pieColors.length]
  }));

  return (
    <div className="chart-shell h-80 rounded-[1.85rem] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tracking-[-0.02em] text-slate-600">Methodology Distribution</p>
        <div className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">
          Diversity
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="28%" outerRadius="92%" data={radialData} startAngle={90} endAngle={-270}>
          <RadialBar background dataKey="value" cornerRadius={14} />
          <Tooltip content={<ChartTooltip />} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityTrendChart({
  data
}: {
  data: { label: string; classes: number; hours: number }[];
}) {
  return (
    <div className="chart-shell h-80 rounded-[1.85rem] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tracking-[-0.02em] text-slate-600">Activity Trend</p>
        <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
          Trend
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(59,130,246,0.24)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8e2ee" />
          <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12 }} />
          <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="classes" fill="url(#activityFill)" stroke="none" />
          <Line type="monotone" dataKey="classes" stroke="#23395d" strokeWidth={3} dot={{ r: 4, strokeWidth: 3, fill: "#fff" }} />
          <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 3, fill: "#fff" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
