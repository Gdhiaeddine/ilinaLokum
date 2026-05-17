"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
  { name: "Kunafa Fromage", value: 80 },
  { name: "Kunafa Pistache", value: 65 },
  { name: "Kunafa Nutella", value: 45 },
  { name: "Mini Kunafa", value: 55 },
  { name: "Boissons", value: 30 },
];

const COLORS = ["#D4AF37", "#C9A227", "#A67C00", "#8C735A", "#6B4F3A"];

export function ProductChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} layout="vertical">
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: "#2C2419", fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: "#E8D5C4" }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FAF3EB",
              border: "1px solid #E8D5C4",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(201,162,39,0.1)",
            }}
            formatter={(val: number) => [`${val} vendus` as any, ""]}
            labelStyle={{ display: "none" }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
