"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ExpensesChartProps {
  data: { day: string; amount: number }[];
}

export function ExpensesChart({ data }: ExpensesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-[#8C735A]">
        <p className="text-sm">Aucune dépense ce mois-ci</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.amount), 1);
  const step = maxVal > 1000 ? Math.ceil(maxVal / 5 / 1000) * 1000 : Math.ceil(maxVal / 5 / 100) * 100;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tick={{ fill: "#6B4F3A", fontSize: 12 }}
            axisLine={{ stroke: "#E8D5C4" }}
          />
          <YAxis
            tick={{ fill: "#6B4F3A", fontSize: 12 }}
            axisLine={{ stroke: "#E8D5C4" }}
            domain={[0, maxVal + step]}
            ticks={Array.from({ length: 6 }, (_, i) => i * step)}
            tickFormatter={(val: number) => val >= 1000 ? `${val / 1000}k` : `${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FAF3EB",
              border: "1px solid #E8D5C4",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(201,162,39,0.1)",
            }}
            formatter={(value: number) => [`${value.toFixed(2)} DA` as any, "Dépenses"]}
            cursor={{ fill: "rgba(201,162,39,0.08)" }}
          />
          <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={18}>
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill="#C9A227" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
