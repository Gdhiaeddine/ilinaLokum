"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/app/actions/sales";
import { KpiCard } from "./_components/KpiCard";
import { SalesChart } from "./_components/SalesChart";
import { ProductChart } from "./_components/ProductChart";
import { RecentSales } from "./_components/RecentSales";
import { IconFactory } from "@/shared/icon-factory";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-48 bg-[#E8D5C4]/50 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-[#E8D5C4]/50 rounded-lg animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-24 bg-[#E8D5C4]/50 rounded animate-pulse" />
                  <div className="h-8 w-32 bg-[#E8D5C4]/50 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-[#E8D5C4]/50 rounded animate-pulse" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#E8D5C4]/50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-6">
              <div className="space-y-3">
                <div className="h-6 w-40 bg-[#E8D5C4]/50 rounded animate-pulse" />
                <div className="h-4 w-56 bg-[#E8D5C4]/50 rounded animate-pulse" />
                <div className="h-[300px] bg-[#E8D5C4]/50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1">
            Tableau de Bord
          </h1>
          <p className="text-brown-light">{new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          label="Revenue du jour"
          value={`${data.todayRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA`}
          change={`${data.revenueChange >= 0 ? "+" : ""}${data.revenueChange}% vs hier`}
          isPositive={data.revenueChange >= 0}
          iconName="Money"
          variant="revenue"
        />
        <KpiCard
          label="Benefice"
          value={`${data.todayProfit.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA`}
          change={`${data.profitChange >= 0 ? "+" : ""}${data.profitChange}% vs hier`}
          isPositive={data.profitChange >= 0}
          iconName="DollarSign"
          variant="profit"
        />
        <KpiCard
          label="Articles vendus"
          value={String(data.todayCount)}
          change={`${data.salesChange >= 0 ? "+" : ""}${data.salesChange}% vs hier`}
          isPositive={data.salesChange >= 0}
          iconName="ShoppingCart"
          variant="sales"
        />
        <KpiCard
          label="Stock Faible"
          value={`${data.lowStock.length} items`}
          change={data.lowStock.length > 0 ? `${data.lowStock.length} alerte(s)` : "RAS"}
          isPositive={data.lowStock.length === 0}
          iconName="AlertTriangle"
          variant="stock"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C2419]">Ventes Hebdomadaires</h2>
              <p className="text-sm text-[#8C735A]">Revenue et bénéfice sur les 7 derniers jours</p>
            </div>
          </div>
          <SalesChart data={data.weeklyData} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C2419]">Produits Populaires</h2>
              <p className="text-sm text-[#8C735A]">Top 5 des produits les plus vendus</p>
            </div>
          </div>
          <ProductChart data={data.topProducts} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C2419]">Transactions Récentes</h2>
              <p className="text-sm text-[#8C735A]">Les dernières ventes du jour</p>
            </div>
          </div>
          <RecentSales sales={data.recentSales} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C2419]">Alertes Stock</h2>
              <p className="text-sm text-[#8C735A]">Produits à surveiller</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${data.lowStock.length > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
              {data.lowStock.length} Alerte(s)
            </span>
          </div>
          <div className="space-y-3">
            {data.lowStock.length === 0 ? (
              <div className="text-center py-8 text-[#8C735A]">
                <IconFactory name="AlertTriangle" size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Aucune alerte de stock</p>
              </div>
            ) : (
              data.lowStock.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <IconFactory name="AlertTriangle" className="text-red-500" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#2C2419] text-sm truncate">{item.name}</p>
                    <p className="text-xs text-red-600">
                      {item.current_stock}{item.unit} restant (min: {item.min_stock}{item.unit})
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
