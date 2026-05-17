'use client'

import { useState } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { getIngredients, addIngredient, updateIngredient, deleteIngredient } from '@/app/actions/ingredients'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function IngredientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({ name: '', unit: 'kg', current_stock: 0, min_stock: 0, avg_price: 0, supplier_id: '' })

  const queryClient = useQueryClient()

  const { data: ingredients = [] } = useQuery({
    queryKey: ['ingredients'],
    queryFn: getIngredients,
  })

  const addMutation = useMutation({
    mutationFn: async (data: FormData) => { await addIngredient(data) },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingredient ajoute')
      setIsModalOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => { await updateIngredient(id, data) },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingredient modifie')
      setIsModalOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Ingredient supprime')
    },
  })

  function resetForm() {
    setFormData({ name: '', unit: 'kg', current_stock: 0, min_stock: 0, avg_price: 0, supplier_id: '' })
    setEditingId(null)
  }

  function openCreate() { resetForm(); setEditingId(null); setIsModalOpen(true) }
  function openEdit(item: any) {
    setFormData({ name: item.name, unit: item.unit, current_stock: item.current_stock, min_stock: item.min_stock, avg_price: item.avg_price, supplier_id: item.supplier_id || '' })
    setEditingId(item.id)
    setIsModalOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => data.append(key, String(value)))
    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      addMutation.mutate(data)
    }
  }

  const filtered = ingredients.filter((i: any) => i.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Ingredients</h1>
          <p className="text-sm text-[#8C735A]">Gerez votre stock d'ingredients</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
          <IconFactory name="Plus" size={18} /> Ajouter un ingredient
        </button>
      </div>

      <div className="relative">
        <IconFactory name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C735A]" size={18} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
      </div>

      <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FAF3EB]">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase">Ingredient</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase">Unite</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase">Stock</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase">Min</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase">Prix Moy.</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D5C4]/50">
              {filtered.map((item: any) => {
                const isLow = item.current_stock <= item.min_stock
                return (
                  <tr key={item.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isLow ? 'bg-red-100' : 'bg-gradient-to-br from-[#D4AF37] to-[#C9A227]'}`}>
                          <IconFactory name="Ingredients" className={isLow ? 'text-red-500' : 'text-white'} size={16} />
                        </div>
                        <span className="font-medium text-[#2C2419] text-sm">{item.name}</span>
                        {isLow && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Stock Faible</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B4F3A]">{item.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${isLow ? 'text-red-600' : 'text-[#2C2419]'}`}>{item.current_stock}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B4F3A]">{item.min_stock}</td>
                    <td className="px-6 py-4 text-sm text-[#6B4F3A]">{item.avg_price} DA/{item.unit}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="p-2 text-[#8C735A] hover:text-[#C9A227] hover:bg-[#F5E9DA] rounded-lg transition-colors"><IconFactory name="Edit" size={16} /></button>
                        <button onClick={() => deleteMutation.mutate(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><IconFactory name="Delete" size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-serif text-xl font-bold text-[#2C2419] mb-1">{editingId ? 'Modifier' : 'Ajouter'} un ingredient</h2>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Nom</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2419] mb-1">Unite</label>
                  <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]">
                    <option value="kg">kg</option><option value="g">g</option><option value="l">l</option><option value="ml">ml</option><option value="piece">piece</option><option value="boite">boite</option><option value="sachet">sachet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2419] mb-1">Stock actuel</label>
                  <input type="number" step="0.01" value={formData.current_stock} onChange={(e) => setFormData({ ...formData, current_stock: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2419] mb-1">Stock minimum</label>
                  <input type="number" step="0.01" value={formData.min_stock} onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2419] mb-1">Prix moyen (DA)</label>
                  <input type="number" step="0.01" value={formData.avg_price} onChange={(e) => setFormData({ ...formData, avg_price: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-[#E8D5C4] text-[#6B4F3A] rounded-xl text-sm font-medium hover:bg-[#FAF3EB] transition-all">Annuler</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-sm font-medium hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20">{editingId ? 'Modifier' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
