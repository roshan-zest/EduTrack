"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Area,
  ComposedChart,
  Line,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const pieColors = ["#1d3557", "#d97757", "#5f6caf", "#7dbb91"];

function getMetricLabel(key?: string) {
  if (key === "classes") {
    return "Classes / Week";
  }

  if (key === "hours") {
    return "Hours / Week";
  }

  if (key === "value") {
    return "Sessions";
  }

  return key ?? "Metric";
}

function formatMetricValue(key: string | undefined, value: number | string | undefined) {
  if (typeof value !== "number") {
    return String(value ?? "-");
  }

  if (key === "hours") {
    return `${value} hrs`;
  }

  if (key === "classes") {
    return `${value} classes`;
  }

  if (key === "value") {
    return `${value} sessions`;
  }

  return String(value);
}

function ChartTooltip({
  active,
  payload,
  label,
  mode = "default"
}: {
  active?: boolean;
  payload?: Array<{
    color?: string;
    dataKey?: string;
    value?: number | string;
    name?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string;
  mode?: "default" | "methodology";
}) {
  if (!active || !payload?.length) {
    return null;
  }

  if (mode === "methodology") {
    const item = payload[0];
    const row = item?.payload as { name?: string; value?: number; percentage?: number } | undefined;

    return (
      <div className="rounded-[1rem] border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Methodology</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{row?.name ?? "Unknown"}</p>
        <div className="mt-2 space-y-1.5 text-sm text-slate-600">
          <p>Sessions: <span className="font-semibold text-slate-800">{row?.value ?? 0}</span></p>
          <p>Share: <span className="font-semibold text-slate-800">{row?.percentage ?? 0}%</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1rem] border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
      {label ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p> : null}
      <div className="mt-2 space-y-1.5">
        {Array.from(
          new Map(
            payload.map((item) => [item.dataKey ?? item.name ?? "metric", item])
          ).values()
        ).map((item, index) => (
          <div
            key={`${item.dataKey ?? "metric"}-${item.name ?? "item"}-${index}`}
            className="flex items-center gap-2 text-sm text-slate-600"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-medium text-slate-700">{item.name ?? getMetricLabel(item.dataKey)}</span>
            <span className="text-slate-500">{formatMetricValue(item.dataKey, item.value)}</span>
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
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radialData = data.map((item, index) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
    fill: pieColors[index % pieColors.length]
  }));

  return (
    <div className="chart-shell rounded-[1.85rem] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tracking-[-0.02em] text-slate-600">Methodology Distribution</p>
        <div className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">
          Diversity
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="28%" outerRadius="92%" data={radialData} startAngle={90} endAngle={-270}>
            <RadialBar background dataKey="value" cornerRadius={14} />
            <Tooltip content={<ChartTooltip mode="methodology" />} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {radialData.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
              <span>{item.name}</span>
            </div>
            <span className="font-semibold text-slate-600">{item.percentage}%</span>
          </div>
        ))}
      </div>
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
        <p className="text-sm font-semibold tracking-[-0.02em] text-slate-600">Weekly Activity Trend</p>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-slate-500">
          <span className="inline-flex items-center gap-1.5 uppercase">
            <span className="h-2 w-2 rounded-full bg-[#23395d]" />
            Classes / Week
          </span>
          <span className="inline-flex items-center gap-1.5 uppercase">
            <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
            Hours / Week
          </span>
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
          <YAxis yAxisId="classes" tick={{ fill: "#475569", fontSize: 12 }} tickFormatter={(value) => `${value}`} />
          <YAxis yAxisId="hours" orientation="right" tick={{ fill: "#7c3aed", fontSize: 12 }} tickFormatter={(value) => `${value}h`} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" yAxisId="classes" dataKey="classes" name="Classes / Week" fill="url(#activityFill)" stroke="none" legendType="none" />
          <Line
            type="monotone"
            yAxisId="classes"
            dataKey="classes"
            name="Classes / Week"
            stroke="#23395d"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 3, fill: "#fff" }}
          />
          <Line
            type="monotone"
            yAxisId="hours"
            dataKey="hours"
            name="Hours / Week"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 3, fill: "#fff" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
