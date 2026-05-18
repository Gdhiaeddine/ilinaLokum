'use client'

import { useState, useMemo } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { useQuery } from '@tanstack/react-query'
import { getReportsData } from '@/app/actions/sales'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#D4AF37', '#C9A227', '#A67C00', '#8C735A', '#6B4F3A']

export default function ReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const periodLabels = {
    daily: `Aujourd'hui`,
    weekly: `Cette semaine`,
    monthly: `Ce mois`,
  }

  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)
  const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset + 6)

  const { data, isLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: () => getReportsData(period),
  })

  const chartData = useMemo(() => {
    if (!data) return []
    return data.chartData.map(d => ({
      name: d.label,
      revenue: d.revenue,
      profit: d.profit,
      cost: d.cost,
    }))
  }, [data])

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-32 bg-[#E8D5C4]/50 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-[#E8D5C4]/50 rounded-lg animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-6">
              <div className="h-6 w-40 bg-[#E8D5C4]/50 rounded animate-pulse mb-6" />
              <div className="h-[300px] bg-[#E8D5C4]/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Rapports</h1>
          <p className="text-sm text-[#8C735A]">
            {period === 'daily'
              ? `Statistiques du ${now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`
              : period === 'weekly'
              ? `Statistiques de la semaine du ${weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} au ${weekEnd.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`
              : `Statistiques du mois de ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
            }
          </p>
        </div>
        <div className="flex gap-2 p-1 bg-[#FAF3EB] rounded-xl">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? 'bg-white text-[#C9A227] shadow-sm' : 'text-[#6B4F3A] hover:text-[#2C2419]'}`}>
              {p === 'daily' ? 'Journalier' : p === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
              <IconFactory name="DollarSign" className="text-white" size={18} />
            </div>
            <span className="text-sm font-medium text-[#6B4F3A]">Revenue total</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#2C2419]">{data.totalRevenue.toFixed(2)} DA</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.totalProfit >= 0 ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-gradient-to-br from-red-400 to-red-500'}`}>
              <IconFactory name="TrendingUp" className="text-white" size={18} />
            </div>
            <span className="text-sm font-medium text-[#6B4F3A]">Benefice net</span>
          </div>
          <p className={`font-serif text-2xl font-bold ${data.totalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {data.totalProfit >= 0 ? '+' : ''}{data.totalProfit.toFixed(2)} DA
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <IconFactory name="ShoppingCart" className="text-white" size={18} />
            </div>
            <span className="text-sm font-medium text-[#6B4F3A]">Articles vendus</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#2C2419]">{data.totalSales}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2C2419] to-[#2C2419]/80 flex items-center justify-center">
              <IconFactory name="BarChart3" className="text-white" size={18} />
            </div>
            <span className="text-sm font-medium text-[#6B4F3A]">Marge nette</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#2C2419]">{data.netMargin.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg font-bold text-[#2C2419]">Ventes et Benefices</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F5E9DA] text-[#C9A227]">{periodLabels[period]}</span>
          </div>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A227" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A227" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2C7A2C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2C7A2C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
                  <XAxis dataKey="name" tick={{ fill: '#6B4F3A', fontSize: 12 }} axisLine={{ stroke: '#E8D5C4' }} />
                  <YAxis tick={{ fill: '#6B4F3A', fontSize: 12 }} axisLine={{ stroke: '#E8D5C4' }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF3EB', border: '1px solid #E8D5C4', borderRadius: '12px' }}
                    formatter={(value: number, name: string) => [`${value.toFixed(2)} DA`, name === 'revenue' ? 'Revenue' : 'Benefice']}
                    labelFormatter={(label) => period === 'daily' ? `${label}` : label}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#C9A227" strokeWidth={3} fill="url(#revGradient)" name="revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#2C7A2C" strokeWidth={2} fill="url(#profGradient)" name="profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#8C735A]">
              <p className="text-sm">Aucune donnee pour cette periode</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg font-bold text-[#2C2419]">Produits Plus Vendus</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F5E9DA] text-[#C9A227]">{periodLabels[period]}</span>
          </div>
          {data.topProducts.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topProducts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#2C2419', fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: '#E8D5C4' }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF3EB', border: '1px solid #E8D5C4', borderRadius: '12px' }}
                    formatter={(val: number) => [`${val} vendus` as any, '']}
                    labelStyle={{ display: 'none' }}
                  />
                  <Bar dataKey="quantity" radius={[0, 8, 8, 0]} barSize={24}>
                    {data.topProducts.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#8C735A]">
              <p className="text-sm">Aucune donnee pour cette periode</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold text-[#2C2419]">Resume financier</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F5E9DA] text-[#C9A227]">{periodLabels[period]}</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#FAF3EB] rounded-xl">
              <span className="text-sm text-[#6B4F3A]">Revenue total</span>
              <span className="font-bold text-[#2C2419]">{data.totalRevenue.toFixed(2)} DA</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FAF3EB] rounded-xl">
              <span className="text-sm text-[#6B4F3A]">Cout des marchandises</span>
              <span className="font-bold text-orange-600">-{data.totalCost.toFixed(2)} DA</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FAF3EB] rounded-xl">
              <span className="text-sm text-[#6B4F3A]">Depenses</span>
              <span className="font-bold text-red-500">-{data.totalExpenses.toFixed(2)} DA</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FAF3EB] rounded-xl">
              <span className="text-sm text-[#6B4F3A]">Achats</span>
              <span className="font-bold text-red-500">-{data.totalPurchases.toFixed(2)} DA</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5E9DA] to-[#FAF3EB] rounded-xl">
              <span className="font-medium text-[#2C2419]">Benefice net</span>
              <span className={`font-serif text-xl font-bold ${data.totalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {data.totalProfit >= 0 ? '+' : ''}{data.totalProfit.toFixed(2)} DA
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold text-[#2C2419]">Details par produit</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F5E9DA] text-[#C9A227]">{periodLabels[period]}</span>
          </div>
          {data.topProducts.length > 0 ? (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#FAF3EB] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center text-white text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-[#2C2419] text-sm">{p.name}</p>
                      <p className="text-xs text-[#8C735A]">{p.quantity} vendus</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#2C2419] text-sm">{p.revenue.toFixed(2)} DA</p>
                    <p className={`text-xs ${p.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {p.profit >= 0 ? '+' : ''}{p.profit.toFixed(2)} DA
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#8C735A]">
              <p className="text-sm">Aucune donnee pour cette periode</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
        <h2 className="font-serif text-lg font-bold text-[#2C2419] mb-4">Exportation</h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-sm font-medium hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20">
            <IconFactory name="Download" size={16} /> Exporter PDF
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-[#E8D5C4] text-[#6B4F3A] rounded-xl text-sm font-medium hover:bg-[#FAF3EB] transition-all">
            <IconFactory name="Download" size={16} /> Exporter Excel
          </button>
        </div>
      </div>
    </div>
  )
}
