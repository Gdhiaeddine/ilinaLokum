'use client'

import { useState, useMemo } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { createSale, getSalesByDate, resetDaySales } from '@/app/actions/sales'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/app/components/ConfirmDialog'

export default function SalesPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [isEditing, setIsEditing] = useState(false)
  const [amount, setAmount] = useState('')
  const [resetConfirm, setResetConfirm] = useState(false)

  const queryClient = useQueryClient()

  const { data: daySales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales-by-date', selectedDate],
    queryFn: () => getSalesByDate(selectedDate),
  })

  const setMutation = useMutation({
    mutationFn: async (value: number) => {
      await createSale(selectedDate, value)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-by-date'] })
      toast.success('Vente enregistree')
      setIsEditing(false)
      setAmount('')
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  const resetMutation = useMutation({
    mutationFn: async () => {
      await resetDaySales(selectedDate)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-by-date'] })
      toast.success('Vente reinitialisee')
    },
    onError: (err: any) => toast.error(err.message || 'Erreur'),
  })

  const totalRevenue = useMemo(() => {
    return daySales.reduce((acc, sale) => acc + (Number(sale.total_amount) || 0), 0)
  }, [daySales])

  const hasSales = daySales.length > 0

  function openEditor() {
    setAmount(hasSales ? String(totalRevenue) : '')
    setIsEditing(true)
  }

  function handleSave() {
    const value = Number(amount)
    if (!value || value <= 0) {
      toast.error('Entrez un montant valide')
      return
    }
    setMutation.mutate(value)
  }

  const formattedDate = new Date(selectedDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Ventes</h1>
          <p className="text-sm text-[#8C735A]">Enregistrez le chiffre d&apos;affaires journalier</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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
      </div>

      {isEditing ? (
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-6 max-w-xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center mx-auto mb-3">
              <IconFactory name="DollarSign" className="text-white" size={26} />
            </div>
            <h2 className="font-serif text-lg font-bold text-[#2C2419]">
              {hasSales ? 'Modifier la vente' : 'Nouvelle vente'}
            </h2>
            <p className="text-sm text-[#8C735A] capitalize mt-1">{formattedDate}</p>
          </div>

          <label className="block text-sm font-medium text-[#6B4F3A] mb-2">
            Chiffre d&apos;affaires du jour
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
              className="w-full px-4 py-4 pr-16 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-2xl font-bold text-[#2C2419] text-center focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#8C735A]">DA</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => { setAmount(''); setIsEditing(false) }}
              className="flex-1 py-3 border border-[#E8D5C4] text-[#6B4F3A] rounded-xl text-sm font-medium hover:bg-[#FAF3EB] transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={setMutation.isPending}
              className="flex-1 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-sm font-medium hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20 disabled:opacity-50"
            >
              {setMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      ) : salesLoading ? (
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-8 max-w-xl mx-auto">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#E8D5C4]/50 animate-pulse" />
            <div className="h-3 w-32 bg-[#E8D5C4]/50 rounded animate-pulse" />
            <div className="h-10 w-48 bg-[#E8D5C4]/50 rounded animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-6 max-w-xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center mx-auto mb-3">
              <IconFactory name="DollarSign" className="text-white" size={28} />
            </div>
            <p className="text-sm font-medium text-[#6B4F3A]">Chiffre d&apos;affaires du jour</p>
            <p className="font-serif text-4xl font-bold text-[#2C2419] mt-1">
              {totalRevenue.toFixed(2)} DA
            </p>
            <p className="text-xs text-[#8C735A] mt-2">
              {hasSales
                ? `${daySales.length} vente${daySales.length > 1 ? 's' : ''} enregistree${daySales.length > 1 ? 's' : ''}`
                : 'Aucune vente pour cette date'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={openEditor}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-sm font-medium hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20"
            >
              <IconFactory name="Edit" size={16} /> {hasSales ? 'Modifier' : 'Ajouter'}
            </button>
            {hasSales && (
              <button
                onClick={() => setResetConfirm(true)}
                disabled={resetMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <IconFactory name="Delete" size={16} /> Reinitialiser
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={resetConfirm}
        title="Reinitialiser la vente du jour"
        message="Le chiffre d'affaires de cette date sera supprime. Cette action est irreversible."
        onConfirm={() => {
          resetMutation.mutate()
          setResetConfirm(false)
        }}
        onCancel={() => setResetConfirm(false)}
      />
    </div>
  )
}
