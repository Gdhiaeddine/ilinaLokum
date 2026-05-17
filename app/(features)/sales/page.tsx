'use client'

import { useState } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { getSales, createSale } from '@/app/actions/sales'
import { getProducts } from '@/app/actions/products'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function SalesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saleItems, setSaleItems] = useState<{ productId: string; quantity: number; price: number }[]>([])
  const [notes, setNotes] = useState('')

  const queryClient = useQueryClient()

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: getSales,
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  const createMutation = useMutation({
    mutationFn: async (data: { formData: FormData; items: typeof saleItems }) => {
      await createSale(data.formData, data.items)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      toast.success('Vente enregistre')
      setIsModalOpen(false)
      setSaleItems([])
      setNotes('')
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  function addItem() {
    if (products.length === 0) return
    setSaleItems([...saleItems, { productId: products[0]?.id, quantity: 1, price: products[0]?.selling_price || 0 }])
  }

  function updateItem(index: number, field: string, value: any) {
    const updated = [...saleItems]
    if (field === 'productId') {
      const product = products.find((p: any) => p.id === value)
      updated[index] = { ...updated[index], productId: value, price: product?.selling_price || 0 }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setSaleItems(updated)
  }

  function removeItem(index: number) {
    setSaleItems(saleItems.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    formData.append('notes', notes)
    createMutation.mutate({ formData, items: saleItems })
  }

  const totalAmount = saleItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Ventes</h1>
          <p className="text-sm text-[#8C735A]">Gerez vos ventes du jour</p>
        </div>
        <button onClick={() => { setSaleItems([]); setIsModalOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
          <IconFactory name="Plus" size={18} /> Nouvelle vente
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FAF3EB]">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase">Produits</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase">Quantite</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D5C4]/50">
              {sales.map((sale: any) => (
                <tr key={sale.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-[#6B4F3A]">
                    {new Date(sale.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
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
                    {sale.sale_items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-[#2C2419]">{sale.total_amount} DA</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl font-bold text-[#2C2419] mb-1">Nouvelle vente</h2>
            <p className="text-sm text-[#8C735A] mb-6">Ajoutez les produits vendus</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {saleItems.map((item, index) => (
                <div key={index} className="p-4 bg-[#FAF3EB] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#2C2419]">Article {index + 1}</span>
                    <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600"><IconFactory name="Delete" size={16} /></button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B4F3A] mb-1">Produit</label>
                    <select value={item.productId} onChange={(e) => updateItem(index, 'productId', e.target.value)} className="w-full px-3 py-2 bg-white border border-[#E8D5C4] rounded-lg text-sm">
                      {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} - {p.selling_price}DA</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#6B4F3A] mb-1">Quantite</label>
                      <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-[#E8D5C4] rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B4F3A] mb-1">Prix unitaire (DA)</label>
                      <input type="number" value={item.price} readOnly className="w-full px-3 py-2 bg-gray-100 border border-[#E8D5C4] rounded-lg text-sm" />
                    </div>
                  </div>
                  <div className="text-right text-sm font-medium text-[#2C2419]">
                    Sous-total: {item.price * item.quantity} DA
                  </div>
                </div>
              ))}

              <button type="button" onClick={addItem} className="w-full py-2.5 border border-dashed border-[#C9A227] text-[#C9A227] rounded-xl text-sm font-medium hover:bg-[#F5E9DA] transition-all">
                <IconFactory name="Plus" size={16} className="inline mr-2" /> Ajouter un article
              </button>

              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30" placeholder="Notes optionnelles..." />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5E9DA] to-[#FAF3EB] rounded-xl">
                <span className="font-medium text-[#2C2419]">Total</span>
                <span className="font-serif text-2xl font-bold text-[#C9A227]">{totalAmount} DA</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-[#E8D5C4] text-[#6B4F3A] rounded-xl text-sm font-medium hover:bg-[#FAF3EB] transition-all">Annuler</button>
                <button type="submit" disabled={saleItems.length === 0} className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-sm font-medium hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20 disabled:opacity-50">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
