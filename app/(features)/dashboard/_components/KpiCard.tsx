"use client";

import { IconFactory } from "@/shared/icon-factory";
import type { IconName } from "@/shared/icon-factory";

interface KpiCardProps {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  iconName: IconName;
  variant: "revenue" | "profit" | "sales" | "stock";
}

const variants = {
  revenue: "from-[#D4AF37]/10 to-[#C9A227]/5 text-[#C9A227]",
  profit: "from-[#2C7A2C]/10 to-[#2C7A2C]/5 text-[#2C7A2C]",
  sales: "from-[#2C2419]/10 to-[#2C2419]/5 text-[#2C2419]",
  stock: "from-[#A67C00]/10 to-[#C9A227]/5 text-[#A67C00]",
};

const iconColors = {
  revenue: "bg-gradient-to-br from-[#D4AF37] to-[#C9A227] text-white",
  profit: "bg-gradient-to-br from-[#2C7A2C] to-[#2C7A2C]/80 text-white",
  sales: "bg-gradient-to-br from-[#2C2419] to-[#2C2419]/80 text-white",
  stock: "bg-gradient-to-br from-[#A67C00] to-[#C9A227] text-white",
};

export function KpiCard({ label, value, change, isPositive = true, variant, iconName }: KpiCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${variants[variant]} p-6 border border-[#E8D5C4]/50 card-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#6B4F3A] mb-1">{label}</p>
          <p className="font-serif text-3xl font-bold text-[#2C2419]">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 ${isPositive ? "text-green-600" : "text-red-500"}`}>
              <IconFactory name={isPositive ? "TrendingUp" : "TrendingDown"} size={14} />
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconColors[variant]} flex items-center justify-center shadow-lg`}>
          <IconFactory name={iconName} size={24} />
        </div>
      </div>
    </div>
  );
}
