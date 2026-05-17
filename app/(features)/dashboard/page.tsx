"use client";

import { KpiCard } from "./_components/KpiCard";
import { SalesChart } from "./_components/SalesChart";
import { ProductChart } from "./_components/ProductChart";
import { RecentSales } from "./_components/RecentSales";
import { IconFactory } from "@/shared/icon-factory";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1">
            Tableau de Bord
          </h1>
          <p className="text-brown-light">{new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20">
          <IconFactory name="Plus" size={18} />
          Nouvelle vente
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          label="Revenue du jour"
          value="24,300 DA"
          change="12% vs hier"
          isPositive
          iconName="Money"
          variant="revenue"
        />
        <KpiCard
          label="Benefice"
          value="12,500 DA"
          change="8% vs hier"
          isPositive
          iconName="DollarSign"
          variant="profit"
        />
        <KpiCard
          label="Ventes"
          value="48"
          change="5% vs hier"
          isPositive
          iconName="ShoppingCart"
          variant="sales"
        />
        <KpiCard
          label="Stock Faible"
          value="3 items"
          change="2 ajoutées"
          isPositive={false}
          iconName="AlertTriangle"
          variant="stock"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C2419]">Ventes Hebdomadaires</h2>
              <p className="text-sm text-[#8C735A]">Revenue et bénéfice sur les 7 derniers jours</p>
            </div>
            <button className="p-2 text-[#8C735A] hover:text-[#C9A227] hover:bg-[#F5E9DA] rounded-xl transition-all">
              <IconFactory name="Download" size={18} />
            </button>
          </div>
          <SalesChart />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C2419]">Produits Populaires</h2>
              <p className="text-sm text-[#8C735A]">Top 5 des produits les plus vendus</p>
            </div>
            <button className="p-2 text-[#8C735A] hover:text-[#C9A227] hover:bg-[#F5E9DA] rounded-xl transition-all">
              <IconFactory name="Download" size={18} />
            </button>
          </div>
          <ProductChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C2419]">Transactions Récentes</h2>
              <p className="text-sm text-[#8C735A]">Les dernières ventes du jour</p>
            </div>
            <button className="text-sm text-[#C9A227] hover:underline font-medium">Voir tout</button>
          </div>
          <RecentSales />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C2419]">Alertes Stock</h2>
              <p className="text-sm text-[#8C735A]">Ingrédients à surveiller</p>
            </div>
            <span className="bg-red-100 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">3 Alertes</span>
          </div>
          <div className="space-y-3">
            {[
              { name: "Pâte Kunafa", stock: 5, min: 20 },
              { name: "Pistache", stock: 0.8, min: 5 },
              { name: "Fromage Akawi", stock: 0.2, min: 2 },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <IconFactory name="AlertTriangle" className="text-red-500" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#2C2419] text-sm truncate">{item.name}</p>
                  <p className="text-xs text-red-600">
                    {item.stock}kg restant (min: {item.min}kg)
                  </p>
                </div>
                <button className="text-xs bg-white border border-red-200 text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                  Commander
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
