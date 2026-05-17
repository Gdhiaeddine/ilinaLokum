'use client'

import { useState } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { getSuppliers } from '@/app/actions/suppliers'
import { getIngredients } from '@/app/actions/ingredients'
import { useQuery } from '@tanstack/react-query'

export default function PurchasesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [items, setItems] = useState([{ ingredientId: '', quantity: 0, price: 0 }])

  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers })
  const { data: ingredients = [] } = useQuery({ queryKey: ['ingredients'], queryFn: getIngredients })

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Achats</h1>
          <p className="text-sm text-[#8C735A]">Enregistrez vos achats d'ingredients</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
          <IconFactory name="Plus" size={18} /> Nouvel achat
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5E9DA] flex items-center justify-center">
          <IconFactory name="Purchases" size={24} className="text-[#C9A227]" />
        </div>
        <h3 className="font-serif text-lg font-bold text-[#2C2419] mb-2">Aucun achat enregistre</h3>
        <p className="text-sm text-[#8C735A] mb-4">Commencez en ajoutant votre premier achat d'ingredients</p>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
          Ajouter un achat
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl font-bold text-[#2C2419] mb-1">Nouvel achat</h2>
            <p className="text-sm text-[#8C735A] mb-6">Enregistrez un achat d'ingredients</p>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Fournisseur</label>
                <select className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm">
                  <option value="">Selectionner un fournisseur</option>
                  {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {items.map((item, index) => (
                <div key={index} className="p-4 bg-[#FAF3EB] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#2C2419]">Article {index + 1}</span>
                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600"><IconFactory name="Delete" size={16} /></button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B4F3A] mb-1">Ingredient</label>
                    <select className="w-full px-3 py-2 bg-white border border-[#E8D5C4] rounded-lg text-sm">
                      <option value="">Selectionner</option>
                      {ingredients.map((ing: any) => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#6B4F3A] mb-1">Quantite</label>
                      <input type="number" min="0" step="0.01" className="w-full px-3 py-2 bg-white border border-[#E8D5C4] rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B4F3A] mb-1">Prix unitaire (DA)</label>
                      <input type="number" min="0" step="0.01" className="w-full px-3 py-2 bg-white border border-[#E8D5C4] rounded-lg text-sm" />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" onClick={() => setItems([...items, { ingredientId: '', quantity: 0, price: 0 }])} className="w-full py-2.5 border border-dashed border-[#C9A227] text-[#C9A227] rounded-xl text-sm font-medium hover:bg-[#F5E9DA] transition-all">
                <IconFactory name="Plus" size={16} className="inline mr-2" /> Ajouter un ingredient
              </button>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5E9DA] to-[#FAF3EB] rounded-xl">
                <span className="font-medium text-[#2C2419]">Total</span>
                <span className="font-serif text-2xl font-bold text-[#C9A227]">{total} DA</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-[#E8D5C4] text-[#6B4F3A] rounded-xl text-sm font-medium hover:bg-[#FAF3EB] transition-all">Annuler</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-sm font-medium hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
