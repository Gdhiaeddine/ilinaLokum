'use client'

import { useState, useMemo } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { createSale, getSalesByDate, deleteSale, updateSale } from '@/app/actions/sales'
import { getProducts } from '@/app/actions/products'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ProductRow {
  id: string
  name: string
  stock: number
  costPrice: number
  salePrice: number
  quantity: number
}

export default function SalesPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [rows, setRows] = useState<ProductRow[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  const { data: daySales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales-by-date', selectedDate],
    queryFn: () => getSalesByDate(selectedDate),
  })

  const createMutation = useMutation({
    mutationFn: async (items: { productId: string; quantity: number; unitPrice: number; costPrice: number }[]) => {
      await createSale(selectedDate, items)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-by-date'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Vente enregistree')
      setRows([])
      setIsEditing(false)
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-by-date'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Vente supprimee')
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ saleId, items }: { saleId: string; items: { productId: string; quantity: number; unitPrice: number; costPrice: number }[] }) => {
      await updateSale(saleId, items)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-by-date'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Vente modifiee')
      setRows([])
      setIsEditing(false)
      setEditingSaleId(null)
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  function startNewSale() {
    const initialized = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      stock: p.current_stock || 0,
      costPrice: p.avg_price || p.production_cost || 0,
      salePrice: p.selling_price || 0,
      quantity: 0,
    }))
    setRows(initialized)
    setIsEditing(true)
    setEditingSaleId(null)
  }

  function startEditSale(sale: any) {
    const initialized = products.map((p: any) => {
      const saleItem = sale.sale_items?.find((si: any) => si.product_id === p.id)
      return {
        id: p.id,
        name: p.name,
        stock: p.current_stock || 0,
        costPrice: saleItem ? Number(saleItem.cost_price) : (p.avg_price || p.production_cost || 0),
        salePrice: saleItem ? Number(saleItem.unit_price) : (p.selling_price || 0),
        quantity: saleItem ? Number(saleItem.quantity) : 0,
      }
    })
    setRows(initialized)
    setIsEditing(true)
    setEditingSaleId(sale.id)
  }

  function updateRow(index: number, field: keyof ProductRow, value: number) {
    const updated = [...rows]
    updated[index] = { ...updated[index], [field]: value }
    setRows(updated)
  }

  function handleSave() {
    const items = rows
      .filter(r => r.quantity > 0)
      .map(r => ({
        productId: r.id,
        quantity: r.quantity,
        unitPrice: r.salePrice,
        costPrice: r.costPrice,
      }))

    if (items.length === 0) {
      toast.error('Entrez au moins une quantite')
      return
    }

    if (editingSaleId) {
      updateMutation.mutate({ saleId: editingSaleId, items })
    } else {
      createMutation.mutate(items)
    }
  }

  const stats = useMemo(() => {
    const activeRows = rows.filter(r => r.quantity > 0)
    const revenue = activeRows.reduce((acc, r) => acc + r.salePrice * r.quantity, 0)
    const consumption = activeRows.reduce((acc, r) => acc + r.costPrice * r.quantity, 0)
    const profit = revenue - consumption
    return { revenue, consumption, profit, soldItems: activeRows.length }
  }, [rows])

  const dayStats = useMemo(() => {
    let revenue = 0
    let profit = 0
    let consumption = 0
    for (const sale of daySales) {
      revenue += Number(sale.total_amount) || 0
      for (const item of sale.sale_items || []) {
        const itemRevenue = Number(item.unit_price) * Number(item.quantity)
        const itemCost = Number(item.cost_price) * Number(item.quantity)
        consumption += itemCost
        profit += itemRevenue - itemCost
      }
    }
    return { revenue, consumption, profit, salesCount: daySales.length }
  }, [daySales])

  const formattedDate = new Date(selectedDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Ventes</h1>
          <p className="text-sm text-[#8C735A]">Enregistrez vos ventes journalieres</p>
        </div>
        {!isEditing && (
          <button
            onClick={startNewSale}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all"
          >
            <IconFactory name="Plus" size={18} /> Nouvelle vente
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <IconFactory name="Calendar" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C735A]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-[#E8D5C4] rounded-xl text-sm text-[#2C2419] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
          />
        </div>
        <span className="text-sm text-[#6B4F3A] capitalize">{formattedDate}</span>
      </div>

      {isEditing ? (
        <>
          <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FAF3EB]">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B4F3A] uppercase">Produit</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B4F3A] uppercase">Stock</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B4F3A] uppercase">Prix d&apos;achat</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B4F3A] uppercase">Prix de vente</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B4F3A] uppercase">Quantite</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B4F3A] uppercase">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D5C4]/50">
                  {rows.map((row, index) => {
                    const lineProfit = (row.salePrice - row.costPrice) * row.quantity
                    return (
                      <tr key={row.id} className={`transition-colors ${row.quantity > 0 ? 'bg-[#F5E9DA]/30' : ''}`}>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-[#2C2419]">{row.name}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-[#6B4F3A]">{row.stock}</span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={row.costPrice}
                            onChange={(e) => updateRow(index, 'costPrice', Number(e.target.value))}
                            className="w-24 mx-auto block px-2 py-1.5 bg-white border border-[#E8D5C4] rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={row.salePrice}
                            onChange={(e) => updateRow(index, 'salePrice', Number(e.target.value))}
                            className="w-24 mx-auto block px-2 py-1.5 bg-white border border-[#E8D5C4] rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            max={row.stock}
                            value={row.quantity || ''}
                            onChange={(e) => updateRow(index, 'quantity', Number(e.target.value))}
                            placeholder="0"
                            className="w-20 mx-auto block px-2 py-1.5 bg-white border border-[#E8D5C4] rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-semibold ${lineProfit > 0 ? 'text-green-600' : lineProfit < 0 ? 'text-red-500' : 'text-[#8C735A]'}`}>
                            {lineProfit > 0 ? '+' : ''}{lineProfit.toFixed(2)} DA
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {stats.soldItems > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
                    <IconFactory name="DollarSign" className="text-white" size={18} />
                  </div>
                  <span className="text-sm font-medium text-[#6B4F3A]">Chiffre d&apos;affaires</span>
                </div>
                <p className="font-serif text-2xl font-bold text-[#2C2419]">{stats.revenue.toFixed(2)} DA</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                    <IconFactory name="TrendingDown" className="text-white" size={18} />
                  </div>
                  <span className="text-sm font-medium text-[#6B4F3A]">Consommation</span>
                </div>
                <p className="font-serif text-2xl font-bold text-[#2C2419]">{stats.consumption.toFixed(2)} DA</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.profit >= 0 ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-gradient-to-br from-red-400 to-red-500'}`}>
                    <IconFactory name="TrendingUp" className="text-white" size={18} />
                  </div>
                  <span className="text-sm font-medium text-[#6B4F3A]">Profit</span>
                </div>
                <p className={`font-serif text-2xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {stats.profit >= 0 ? '+' : ''}{stats.profit.toFixed(2)} DA
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setRows([]); setIsEditing(false); setEditingSaleId(null) }}
              className="flex-1 py-3 border border-[#E8D5C4] text-[#6B4F3A] rounded-xl text-sm font-medium hover:bg-[#FAF3EB] transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-sm font-medium hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20 disabled:opacity-50"
            >
              {(createMutation.isPending || updateMutation.isPending) ? 'Enregistrement...' : (editingSaleId ? 'Modifier la vente' : 'Enregistrer la vente')}
            </button>
          </div>
        </>
      ) : (
        <>
          {salesLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[#E8D5C4]/50 animate-pulse" />
                      <div className="h-4 w-28 bg-[#E8D5C4]/50 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-32 bg-[#E8D5C4]/50 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8D5C4]/50">
                  <div className="h-6 w-40 bg-[#E8D5C4]/50 rounded-lg animate-pulse" />
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[#E8D5C4]/50 animate-pulse" />
                      <div className="h-4 w-24 bg-[#E8D5C4]/50 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-[#E8D5C4]/50 rounded animate-pulse ml-auto" />
                      <div className="h-4 w-20 bg-[#E8D5C4]/50 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {dayStats.salesCount > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
                        <IconFactory name="DollarSign" className="text-white" size={18} />
                      </div>
                      <span className="text-sm font-medium text-[#6B4F3A]">Chiffre d&apos;affaires</span>
                    </div>
                    <p className="font-serif text-2xl font-bold text-[#2C2419]">{dayStats.revenue.toFixed(2)} DA</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                        <IconFactory name="TrendingDown" className="text-white" size={18} />
                      </div>
                      <span className="text-sm font-medium text-[#6B4F3A]">Consommation</span>
                    </div>
                    <p className="font-serif text-2xl font-bold text-[#2C2419]">{dayStats.consumption.toFixed(2)} DA</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dayStats.profit >= 0 ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-gradient-to-br from-red-400 to-red-500'}`}>
                        <IconFactory name="TrendingUp" className="text-white" size={18} />
                      </div>
                      <span className="text-sm font-medium text-[#6B4F3A]">Profit</span>
                    </div>
                    <p className={`font-serif text-2xl font-bold ${dayStats.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {dayStats.profit >= 0 ? '+' : ''}{dayStats.profit.toFixed(2)} DA
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8D5C4]/50">
                  <h2 className="font-serif text-lg font-bold text-[#2C2419]">Historique du jour</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#FAF3EB]">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B4F3A] uppercase">Produits</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B4F3A] uppercase">Quantite</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B4F3A] uppercase">Total</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B4F3A] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8D5C4]/50">
                      {daySales.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-[#8C735A]">
                            <IconFactory name="ShoppingCart" size={32} className="mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Aucune vente pour cette date</p>
                          </td>
                        </tr>
                      ) : (
                        daySales.map((sale: any) => (
                          <tr key={sale.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
                                  <IconFactory name="ShoppingCart" className="text-white" size={14} />
                                </div>
                                <span className="text-sm text-[#2C2419] font-medium">
                                  {sale.sale_items?.length || 0} article(s)
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B4F3A]">
                              {sale.sale_items?.reduce((acc: number, item: any) => acc + Number(item.quantity), 0) || 0}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-[#2C2419]">{Number(sale.total_amount).toFixed(2)} DA</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => startEditSale(sale)} className="p-2 text-[#8C735A] hover:text-[#C9A227] hover:bg-[#F5E9DA] rounded-lg transition-colors">
                                  <IconFactory name="Edit" size={16} />
                                </button>
                                <button onClick={() => deleteMutation.mutate(sale.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <IconFactory name="Delete" size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
