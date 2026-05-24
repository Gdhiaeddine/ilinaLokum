'use client'

import { useState } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { getExpenses, addExpense, deleteExpense } from '@/app/actions/expenses'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/app/components/ConfirmDialog'

export default function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })
  const [filterDate, setFilterDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const queryClient = useQueryClient()

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  })

  const filteredExpenses = expenses.filter((e: any) => {
    if (!filterDate) return true
    const d = new Date(e.date).toISOString().split('T')[0]
    return d === filterDate
  })

  const totalAmount = filteredExpenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0)

  const addMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('description', description)
      formData.append('amount', amount)
      formData.append('date', date)
      await addExpense(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Depense enregistree')
      setIsModalOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Depense supprimee')
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  function resetForm() {
    setDescription('')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    addMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Mes Depenses</h1>
          <p className="text-sm text-[#8C735A]">Enregistrez et consultez vos depenses</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-[#F5E9DA] border-[#C9A227] text-[#C9A227]' : 'border-[#E8D5C4] text-[#6B4F3A] hover:bg-[#FAF3EB]'}`}>
            <IconFactory name="Filter" size={16} /> Filtrer
          </button>
          <button onClick={() => { resetForm(); setIsModalOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
            <IconFactory name="Plus" size={18} /> Nouvelle depense
          </button>
        </div>
      </div>

      {/* Carte total */}
      <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#8C735A] mb-1">Total des depenses</p>
            <p className="font-serif text-2xl font-bold text-[#2C2419]">{totalAmount.toFixed(2)} DA</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
            <IconFactory name="DollarSign" className="text-white" size={24} />
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 flex-wrap">
            <div>
              <label className="block text-xs font-medium text-[#6B4F3A] mb-1">Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm text-[#2C2419] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
              />
            </div>
            {filterDate && (
              <button onClick={() => setFilterDate('')} className="px-3 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all">
                <IconFactory name="Close" size={14} className="inline mr-1" /> Effacer filtre
              </button>
            )}
            <span className="text-xs text-[#8C735A]">
              {filterDate ? `${filteredExpenses.length} depense(s) trouvee(s)` : `${expenses.length} depense(s) au total`}
            </span>
          </div>
        </div>
      )}

      {isLoading ? (
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
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-6 md:p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5E9DA] flex items-center justify-center">
            <IconFactory name="DollarSign" size={24} className="text-[#C9A227]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#2C2419] mb-2">
            {filterDate ? 'Aucune depense pour cette date' : 'Aucune depense enregistree'}
          </h3>
          <p className="text-sm text-[#8C735A] mb-4">
            {filterDate ? 'Essayez avec une autre date' : 'Commencez en ajoutant votre premiere depense'}
          </p>
          {!filterDate && (
            <button onClick={() => { resetForm(); setIsModalOpen(true) }} className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
              Ajouter une depense
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAF3EB]">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Description</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Montant</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5C4]/50">
                {filteredExpenses.map((expense: any) => {
                  const expenseDate = new Date(expense.date)
                  return (
                    <tr key={expense.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#2C2419]">{expenseDate.toLocaleDateString('fr-FR')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#2C2419]">{expense.description}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-[#2C2419]">{expense.amount.toFixed(2)} DA</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button onClick={() => setDeleteConfirm({ isOpen: true, id: expense.id })} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <IconFactory name="Delete" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-[#E8D5C4]/50">
            {filteredExpenses.map((expense: any) => {
              const expenseDate = new Date(expense.date)
              return (
                <div key={expense.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#2C2419] text-sm">{expenseDate.toLocaleDateString('fr-FR')}</span>
                    <span className="font-bold text-[#2C2419] text-sm">{expense.amount.toFixed(2)} DA</span>
                  </div>
                  <p className="text-sm text-[#6B4F3A] mb-2">{expense.description}</p>
                  <div className="flex items-center justify-end">
                    <button onClick={() => setDeleteConfirm({ isOpen: true, id: expense.id })} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <IconFactory name="Delete" size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Supprimer la depense"
        message="Cette action est irreversible. Voulez-vous continuer ?"
        onConfirm={() => {
          if (deleteConfirm.id) deleteMutation.mutate(deleteConfirm.id)
          setDeleteConfirm({ isOpen: false, id: null })
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl font-bold text-[#2C2419] mb-1">Nouvelle depense</h2>
            <p className="text-sm text-[#8C735A] mb-6">Enregistrez une nouvelle depense</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm text-[#2C2419] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm text-[#2C2419] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
                  placeholder="Ex: Loyer, Electricite, Transport..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Montant (DA)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm text-[#2C2419] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30"
                  placeholder="0.00"
                  required
                />
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
