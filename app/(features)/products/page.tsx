'use client'

import { useState } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/app/actions/products'
import { getCategories } from '@/app/actions/categories'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    selling_price: 0,
    production_cost: 0,
    current_stock: 0,
    min_stock: 0,
    unit: 'kg',
    avg_price: 0,
  })

  const queryClient = useQueryClient()

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
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
    setFormData({
      name: '', category_id: '', selling_price: 0,
      production_cost: 0, current_stock: 0, min_stock: 0,
      unit: 'kg', avg_price: 0,
    })
    setEditingId(null)
  }

  function openCreate() { resetForm(); setEditingId(null); setIsModalOpen(true) }

  function openEdit(item: any) {
    setFormData({
      name: item.name,
      category_id: item.category_id || '',
      selling_price: item.selling_price,
      production_cost: item.production_cost,
      current_stock: item.current_stock,
      min_stock: item.min_stock,
      unit: item.unit,
      avg_price: item.avg_price,
    })
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
          <p className="text-sm text-[#8C735A]">Gerez vos produits et matieres premieres</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
          <IconFactory name="Plus" size={18} /> Ajouter un produit
        </button>
      </div>

      <div className="relative">
        <IconFactory name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C735A]" size={18} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="w-full pl-10 pr-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5E9DA] flex items-center justify-center">
            <IconFactory name="Products" size={24} className="text-[#C9A227]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#2C2419] mb-2">
            {search ? 'Aucun resultat' : 'Aucun produit enregistre'}
          </h3>
          <p className="text-sm text-[#8C735A] mb-4">
            {search ? 'Essayez avec d\'autres termes' : 'Commencez en ajoutant votre premier produit'}
          </p>
          {!search && (
            <button onClick={openCreate} className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
              Ajouter un produit
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product: any) => {
          const isLow = product.current_stock <= product.min_stock
          const margin = product.selling_price > 0 ? ((product.selling_price - product.production_cost) / product.selling_price) * 100 : 0
          return (
            <div key={product.id} className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-[#F5E9DA] to-[#FAF3EB] flex items-center justify-center relative">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${isLow ? 'bg-red-100' : 'bg-gradient-to-br from-[#D4AF37] to-[#C9A227]'}`}>
                  <IconFactory name="Products" className={isLow ? 'text-red-500' : 'text-white'} size={32} />
                </div>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(product)} className="p-1.5 bg-white/80 backdrop-blur rounded-lg text-[#6B4F3A] hover:text-[#C9A227] transition-colors"><IconFactory name="Edit" size={14} /></button>
                  <button onClick={() => deleteMutation.mutate(product.id)} className="p-1.5 bg-white/80 backdrop-blur rounded-lg text-red-400 hover:text-red-600 transition-colors"><IconFactory name="Delete" size={14} /></button>
                </div>
                {isLow && (
                  <span className="absolute top-3 left-3 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Stock Faible</span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#C9A227] bg-[#F5E9DA] px-2 py-0.5 rounded-full capitalize">{categories.find((c: any) => c.id === product.category_id)?.name || 'Sans categorie'}</span>
                  <span className="text-xs text-[#8C735A]">{margin.toFixed(0)}% marge</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2C2419] mb-3">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#8C735A]">Prix de vente</p>
                    <p className="font-bold text-[#2C2419]">{product.selling_price} DA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8C735A]">Prix d'achat</p>
                    <p className="font-bold text-[#6B4F3A]">{product.production_cost ? `${product.production_cost} DA` : '-'}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E8D5C4]/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#8C735A]">Stock</p>
                    <p className={`text-sm font-bold ${isLow ? 'text-red-600' : 'text-[#2C2419]'}`}>{product.current_stock} <span className="text-xs font-normal text-[#8C735A]">{product.unit}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8C735A]">Stock min</p>
                    <p className="text-sm font-bold text-[#6B4F3A]">{product.min_stock} <span className="text-xs font-normal text-[#8C735A]">{product.unit}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl font-bold text-[#2C2419] mb-1">{editingId ? 'Modifier' : 'Ajouter'} un produit</h2>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Nom</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Categorie</label>
                <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]">
                  <option value="">Sans categorie</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2419] mb-1">Prix de vente (DA)</label>
                  <input type="number" step="0.01" value={formData.selling_price} onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required min={0} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2419] mb-1">Prix d'achat (DA)</label>
                  <input type="number" step="0.01" value={formData.production_cost || ''} onChange={(e) => setFormData({ ...formData, production_cost: e.target.value ? Number(e.target.value) : 0 })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" min={0} placeholder="Mis a jour automatiquement" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2419] mb-1">Stock actuel</label>
                  <input type="number" step="0.01" value={formData.current_stock} onChange={(e) => setFormData({ ...formData, current_stock: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required min={0} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2419] mb-1">Stock minimum</label>
                  <input type="number" step="0.01" value={formData.min_stock} onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required min={0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2419] mb-1">Unite</label>
                  <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]">
                    <option value="kg">kg</option><option value="g">g</option><option value="l">l</option><option value="ml">ml</option><option value="piece">piece</option><option value="boite">boite</option><option value="sachet">sachet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C2419] mb-1">Prix moyen (DA)</label>
                  <input type="number" step="0.01" value={formData.avg_price} onChange={(e) => setFormData({ ...formData, avg_price: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required min={0} />
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
