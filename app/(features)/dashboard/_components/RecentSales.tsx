"use client";

import { IconFactory } from "@/shared/icon-factory";

interface RecentSale {
  id: string;
  products: string;
  total: number;
  time: string;
}

interface RecentSalesProps {
  sales: RecentSale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  if (!sales || sales.length === 0) {
    return (
      <div className="text-center py-8 text-[#8C735A]">
        <IconFactory name="ShoppingCart" size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">Aucune vente aujourd'hui</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sales.map((sale) => (
        <div
          key={sale.id}
          className="flex items-center justify-between p-4 rounded-xl bg-[#FAF3EB] border border-[#E8D5C4]/50 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
              <IconFactory name="ShoppingCart" className="text-white" size={18} />
            </div>
            <div>
              <p className="font-medium text-[#2C2419] text-sm">{sale.products}</p>
              <p className="text-xs text-[#8C735A]">{sale.time}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-[#2C2419]">{sale.total.toFixed(2)} DA</p>
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <IconFactory name="TrendingUp" size={12} /> Completee
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
