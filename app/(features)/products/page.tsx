'use client'

import { useState } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/app/actions/products'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const categories = [
  { value: 'kunafa', label: 'Kunafa' },
  { value: 'boisson', label: 'Boisson' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'autre', label: 'Autre' },
]

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({ name: '', category: 'kunafa', selling_price: 0, production_cost: 0 })

  const queryClient = useQueryClient()

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  const addMutation = useMutation({
    mutationFn: async (data: FormData) => { await addProduct(data) },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produit ajoute')
      setIsModalOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => { await updateProduct(id, data) },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produit modifie')
      setIsModalOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produit supprime')
    },
  })

  function resetForm() {
    setFormData({ name: '', category: 'kunafa', selling_price: 0, production_cost: 0 })
    setEditingId(null)
  }

  function openCreate() { resetForm(); setEditingId(null); setIsModalOpen(true) }

  function openEdit(item: any) {
    setFormData({ name: item.name, category: item.category, selling_price: item.selling_price, production_cost: item.production_cost })
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

  const filtered = products.filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Produits</h1>
          <p className="text-sm text-[#8C735A]">Gerez vos produits Kunafa</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
          <IconFactory name="Plus" size={18} /> Ajouter un produit
        </button>
      </div>

      <div className="relative">
        <IconFactory name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C735A]" size={18} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="w-full pl-10 pr-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((product: any) => {
          const margin = ((product.selling_price - product.production_cost) / product.selling_price) * 100
          return (
            <div key={product.id} className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-[#F5E9DA] to-[#FAF3EB] flex items-center justify-center relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center shadow-lg shadow-[#C9A227]/20">
                  <IconFactory name="Products" className="text-white" size={32} />
                </div>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(product)} className="p-1.5 bg-white/80 backdrop-blur rounded-lg text-[#6B4F3A] hover:text-[#C9A227] transition-colors"><IconFactory name="Edit" size={14} /></button>
                  <button onClick={() => deleteMutation.mutate(product.id)} className="p-1.5 bg-white/80 backdrop-blur rounded-lg text-red-400 hover:text-red-600 transition-colors"><IconFactory name="Delete" size={14} /></button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#C9A227] bg-[#F5E9DA] px-2 py-0.5 rounded-full capitalize">{product.category}</span>
                  <span className="text-xs text-[#8C735A]">{margin.toFixed(0)}% marge</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2C2419] mb-3">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#8C735A]">Prix de vente</p>
                    <p className="font-bold text-[#2C2419]">{product.selling_price} DA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8C735A]">Cout de production</p>
                    <p className="font-bold text-[#6B4F3A]">{product.production_cost} DA</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-serif text-xl font-bold text-[#2C2419] mb-1">{editingId ? 'Modifier' : 'Ajouter'} un produit</h2>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Nom</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Categorie</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]">
                  {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2419] mb-1">Prix de vente (DA)</label>
                  <input type="number" step="0.01" value={formData.selling_price} onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required min={0} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2419] mb-1">Cout de production (DA)</label>
                  <input type="number" step="0.01" value={formData.production_cost} onChange={(e) => setFormData({ ...formData, production_cost: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required min={0} />
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
