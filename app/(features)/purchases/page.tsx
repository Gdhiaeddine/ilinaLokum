'use client'

import { useState } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { getSuppliers } from '@/app/actions/suppliers'
import { getProducts } from '@/app/actions/products'
import { getPurchases, addPurchase, deletePurchase } from '@/app/actions/purchases'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function PurchasesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [supplierId, setSupplierId] = useState('')
  const [items, setItems] = useState([{ productId: '', quantity: 0, price: 0 }])

  const queryClient = useQueryClient()

  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers })
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts })
  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({ queryKey: ['purchases'], queryFn: getPurchases })

  const addMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('supplier_id', supplierId)
      const validItems = items.filter(i => i.productId && i.quantity > 0 && i.price > 0)
      if (!supplierId) throw new Error('Selectionnez un fournisseur')
      if (validItems.length === 0) throw new Error('Ajoutez au moins un article valide')
      await addPurchase(formData, validItems)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Achat enregistre')
      setIsModalOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      toast.success('Achat supprime')
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  function resetForm() {
    setSupplierId('')
    setItems([{ productId: '', quantity: 0, price: 0 }])
  }

  function updateItem(index: number, field: string, value: string | number) {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    addMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Achats</h1>
          <p className="text-sm text-[#8C735A]">Enregistrez vos achats de produits</p>
        </div>
        <button onClick={() => { resetForm(); setIsModalOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
          <IconFactory name="Plus" size={18} /> Nouvel achat
        </button>
      </div>

      {purchasesLoading ? (
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8D5C4]/50">
            <div className="h-6 w-40 bg-[#E8D5C4]/50 rounded-lg animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-[#E8D5C4]/50 animate-pulse" />
                <div className="h-4 w-24 bg-[#E8D5C4]/50 rounded animate-pulse" />
                <div className="h-4 w-40 bg-[#E8D5C4]/50 rounded animate-pulse" />
                <div className="h-4 w-20 bg-[#E8D5C4]/50 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : purchases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5E9DA] flex items-center justify-center">
            <IconFactory name="Purchases" size={24} className="text-[#C9A227]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#2C2419] mb-2">Aucun achat enregistre</h3>
          <p className="text-sm text-[#8C735A] mb-4">Commencez en ajoutant votre premier achat</p>
          <button onClick={() => { resetForm(); setIsModalOpen(true) }} className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
            Ajouter un achat
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAF3EB]">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Fournisseur</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Articles</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Total</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5C4]/50">
                {purchases.map((purchase: any) => (
                  <tr key={purchase.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-[#2C2419]">
                      {new Date(purchase.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
                          <IconFactory name="Suppliers" className="text-white" size={16} />
                        </div>
                        <span className="font-medium text-[#2C2419] text-sm">{purchase.suppliers?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B4F3A]">
                      {purchase.purchase_items?.map((pi: any) =>
                        `${pi.products?.name || '?'} (${pi.quantity} ${pi.products?.unit || ''})`
                      ).join(', ') || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-[#2C2419]">{purchase.total_amount} DA</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button onClick={() => deleteMutation.mutate(purchase.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <IconFactory name="Delete" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl font-bold text-[#2C2419] mb-1">Nouvel achat</h2>
            <p className="text-sm text-[#8C735A] mb-6">Enregistrez un achat de produits</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Fournisseur</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm"
                  required
                >
                  <option value="">Selectionner un fournisseur</option>
                  {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {items.map((item, index) => (
                <div key={index} className="p-4 bg-[#FAF3EB] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#2C2419]">Article {index + 1}</span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600">
                        <IconFactory name="Delete" size={16} />
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B4F3A] mb-1">Produit</label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E8D5C4] rounded-lg text-sm"
                      required
                    >
                      <option value="">Selectionner</option>
                      {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#6B4F3A] mb-1">Quantite</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-[#E8D5C4] rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B4F3A] mb-1">Prix unitaire (DA)</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.price || ''}
                        onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-[#E8D5C4] rounded-lg text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" onClick={() => setItems([...items, { productId: '', quantity: 0, price: 0 }])} className="w-full py-2.5 border border-dashed border-[#C9A227] text-[#C9A227] rounded-xl text-sm font-medium hover:bg-[#F5E9DA] transition-all">
                <IconFactory name="Plus" size={16} className="inline mr-2" /> Ajouter un produit
              </button>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5E9DA] to-[#FAF3EB] rounded-xl">
                <span className="font-medium text-[#2C2419]">Total</span>
                <span className="font-serif text-2xl font-bold text-[#C9A227]">{total.toFixed(2)} DA</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-[#E8D5C4] text-[#6B4F3A] rounded-xl text-sm font-medium hover:bg-[#FAF3EB] transition-all">Annuler</button>
                <button type="submit" disabled={addMutation.isPending} className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-sm font-medium hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20 disabled:opacity-50">
                  {addMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
