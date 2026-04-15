"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const pieColors = ["#1d3557", "#d97757", "#5f6caf", "#7dbb91"];

export function WorkloadChart({
  data
}: {
  data: { name: string; hours: number }[];
}) {
  return (
    <div className="glass-panel h-80 rounded-[1.75rem] p-5">
      <p className="mb-4 text-sm font-semibold tracking-[-0.02em] text-slate-600">Teaching Hours Per Teacher</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8e2ee" />
          <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} />
          <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="hours" radius={[14, 14, 0, 0]} fill="#23395d" />
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
  return (
    <div className="glass-panel h-80 rounded-[1.75rem] p-5">
      <p className="mb-4 text-sm font-semibold tracking-[-0.02em] text-slate-600">Methodology Distribution</p>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
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
    <div className="glass-panel h-80 rounded-[1.75rem] p-5">
      <p className="mb-4 text-sm font-semibold tracking-[-0.02em] text-slate-600">Activity Trend</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d8e2ee" />
          <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12 }} />
          <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="classes" stroke="#23395d" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="hours" stroke="#df7b52" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
