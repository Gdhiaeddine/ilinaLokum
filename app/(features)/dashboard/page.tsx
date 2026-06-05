"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/app/actions/sales";
import { KpiCard } from "./_components/KpiCard";
import { SalesChart } from "./_components/SalesChart";
import { TopSuppliers } from "./_components/TopSuppliers";
import { ExpensesChart } from "./_components/ExpensesChart";
import { RecentSales } from "./_components/RecentSales";

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
          label="Chiffre d'affaires du mois"
          value={`${data.monthRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA`}
          change={`${data.monthRevenueChange >= 0 ? "+" : ""}${data.monthRevenueChange}% vs mois -1`}
          isPositive={data.monthRevenueChange >= 0}
          iconName="Money"
          variant="revenue"
        />
        <KpiCard
          label="Achats + dépenses du mois"
          value={`${data.monthPurchasesExpenses.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA`}
          change={`${data.monthPurchasesChange >= 0 ? "+" : ""}${data.monthPurchasesChange}% vs mois -1`}
          isPositive={data.monthPurchasesChange <= 0}
          iconName="Purchases"
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
              <h2 className="font-serif text-lg font-bold text-[#2C2419]">Top Fournisseurs du Mois</h2>
              <p className="text-sm text-[#8C735A]">Classement par montant d'achat</p>
            </div>
          </div>
          <TopSuppliers data={data.topSuppliers} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C2419]">Dépenses du Mois</h2>
              <p className="text-sm text-[#8C735A]">Évolution journalière des dépenses</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F5E9DA] text-[#C9A227]">
              {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </span>
          </div>
          <ExpensesChart data={data.monthExpensesByDay} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C2419]">Ventes Récentes</h2>
              <p className="text-sm text-[#8C735A]">Les dernières ventes du jour</p>
            </div>
          </div>
          <RecentSales sales={data.recentSales} />
        </div>
      </div>
    </div>
  );
}
