'use client'

import { useState } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { SalesChart } from '@/app/(features)/dashboard/_components/SalesChart'
import { ProductChart } from '@/app/(features)/dashboard/_components/ProductChart'

export default function ReportsPage() {
  const [period, setPeriod] = useState('daily')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Rapports</h1>
          <p className="text-sm text-[#8C735A]">Analysez vos performances commerciales</p>
        </div>
        <div className="flex gap-2 p-1 bg-[#FAF3EB] rounded-xl">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? 'bg-white text-[#C9A227] shadow-sm' : 'text-[#6B4F3A] hover:text-[#2C2419]'}`}>
              {p === 'daily' ? 'Journalier' : p === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <h2 className="font-serif text-lg font-bold text-[#2C2419] mb-6">Ventes et Benefices</h2>
          <SalesChart />
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <h2 className="font-serif text-lg font-bold text-[#2C2419] mb-6">Produits Plus Vendus</h2>
          <ProductChart />
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
