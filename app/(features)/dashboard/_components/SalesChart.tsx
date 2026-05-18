"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SalesChartProps {
  data: { day: string; revenue: number; profit: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-[#8C735A]">
        <p className="text-sm">Aucune donnee pour cette periode</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.profit)), 1);
  const step = maxVal > 1000 ? Math.ceil(maxVal / 5 / 1000) * 1000 : Math.ceil(maxVal / 5 / 100) * 100;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C9A227" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#C9A227" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2C7A2C" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2C7A2C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
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
            formatter={(value: number, name: string) => [`${value.toFixed(2)} DA` as any, name === "revenue" ? "Revenue" : "Benefice"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#C9A227"
            strokeWidth={3}
            fill="url(#salesGradient)"
            name="revenue"
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#2C7A2C"
            strokeWidth={2}
            fill="url(#profitGradient)"
            name="profit"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
