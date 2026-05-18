'use client'

import { useState } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from '@/app/actions/suppliers'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function SuppliersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', email: '', notes: '' })

  const queryClient = useQueryClient()

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers,
  })

  const addMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await addSupplier(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Fournisseur ajoute')
      setIsModalOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      await updateSupplier(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Fournisseur modifie')
      setIsModalOpen(false)
      setEditingId(null)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Fournisseur supprime')
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  function resetForm() {
    setFormData({ name: '', phone: '', address: '', email: '', notes: '' })
    setEditingId(null)
  }

  function openCreate() {
    resetForm()
    setEditingId(null)
    setIsModalOpen(true)
  }

  function openEdit(supplier: any) {
    setFormData({
      name: supplier.name || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      email: supplier.email || '',
      notes: supplier.notes || '',
    })
    setEditingId(supplier.id)
    setIsModalOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => data.append(key, value))

    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      addMutation.mutate(data)
    }
  }

  const filteredSuppliers = suppliers.filter((s: any) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Fournisseurs</h1>
          <p className="text-sm text-[#8C735A]">Gerez vos fournisseurs</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20"
        >
          <IconFactory name="Plus" size={18} />
          Ajouter un fournisseur
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <IconFactory name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C735A]" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un fournisseur..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm text-[#2C2419] placeholder:text-[#8C735A]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
        />
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5E9DA] flex items-center justify-center">
            <IconFactory name="Suppliers" size={24} className="text-[#C9A227]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#2C2419] mb-2">
            {search ? 'Aucun resultat' : 'Aucun fournisseur enregistre'}
          </h3>
          <p className="text-sm text-[#8C735A] mb-4">
            {search ? 'Essayez avec d\'autres termes' : 'Commencez en ajoutant votre premier fournisseur'}
          </p>
          {!search && (
            <button onClick={openCreate} className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
              Ajouter un fournisseur
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAF3EB]">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Nom</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Telephone</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Adresse</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5C4]/50">
                {filteredSuppliers.map((supplier: any) => (
                  <tr key={supplier.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
                          <IconFactory name="Suppliers" className="text-white" size={16} />
                        </div>
                        <span className="font-medium text-[#2C2419] text-sm">{supplier.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B4F3A]">{supplier.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-[#6B4F3A]">{supplier.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-[#6B4F3A]">{supplier.address || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(supplier)} className="p-2 text-[#8C735A] hover:text-[#C9A227] hover:bg-[#F5E9DA] rounded-lg transition-colors">
                          <IconFactory name="Edit" size={16} />
                        </button>
                        <button onClick={() => deleteMutation.mutate(supplier.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-serif text-xl font-bold text-[#2C2419] mb-1">{editingId ? 'Modifier' : 'Ajouter'} un fournisseur</h2>
            <p className="text-sm text-[#8C735A] mb-6">Remplissez les informations du fournisseur</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Nom</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Telephone</label>
                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Adresse</label>
                <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
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
