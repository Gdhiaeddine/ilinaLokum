"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Lun", sales: 450, profit: 180 },
  { name: "Mar", sales: 520, profit: 210 },
  { name: "Mer", sales: 380, profit: 150 },
  { name: "Jeu", sales: 610, profit: 280 },
  { name: "Ven", sales: 750, profit: 320 },
  { name: "Sam", sales: 890, profit: 420 },
  { name: "Dim", sales: 650, profit: 290 },
];

export function SalesChart() {
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
            dataKey="name"
            tick={{ fill: "#6B4F3A", fontSize: 12 }}
            axisLine={{ stroke: "#E8D5C4" }}
          />
          <YAxis
            tick={{ fill: "#6B4F3A", fontSize: 12 }}
            axisLine={{ stroke: "#E8D5C4" }}
            tickFormatter={(val: number) => `${val}DA`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FAF3EB",
              border: "1px solid #E8D5C4",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(201,162,39,0.1)",
            }}
            formatter={(value: number) => [`${value} DA` as any, ""]}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#C9A227"
            strokeWidth={3}
            fill="url(#salesGradient)"
            name="Ventes"
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#2C7A2C"
            strokeWidth={2}
            fill="url(#profitGradient)"
            name="Bénéfice"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
