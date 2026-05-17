"use client";

import { IconFactory } from "@/shared/icon-factory";

const recentSales = [
  { id: "1", product: "Kunafa Fromage (2)", total: 500, time: "Il y a 5 min", status: "completed" },
  { id: "2", product: "Kunafa Pistache (1)", total: 350, time: "Il y a 12 min", status: "completed" },
  { id: "3", product: "Kunafa Nutella (3)", total: 1050, time: "Il y a 25 min", status: "completed" },
  { id: "4", product: "Mini Kunafa (5)", total: 1600, time: "Il y a 1h", status: "completed" },
  { id: "5", product: "Boissons (4)", total: 280, time: "Il y a 2h", status: "pending" },
];

export function RecentSales() {
  return (
    <div className="space-y-3">
      {recentSales.map((sale) => (
        <div
          key={sale.id}
          className="flex items-center justify-between p-4 rounded-xl bg-[#FAF3EB] border border-[#E8D5C4]/50 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
              <IconFactory name="ShoppingCart" className="text-white" size={18} />
            </div>
            <div>
              <p className="font-medium text-[#2C2419] text-sm">{sale.product}</p>
              <p className="text-xs text-[#8C735A]">{sale.time}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-[#2C2419]">{sale.total} DA</p>
            {sale.status === "completed" ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <IconFactory name="TrendingUp" size={12} /> Completé
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                <IconFactory name="Clock" size={12} /> En cours
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
