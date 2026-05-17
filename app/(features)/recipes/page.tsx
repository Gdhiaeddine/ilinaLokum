'use client'

import { useState } from 'react'
import { IconFactory } from '@/shared/icon-factory'

export default function RecipesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Recettes</h1>
          <p className="text-sm text-[#8C735A]">Definissez les recettes de vos produits</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
          <IconFactory name="Plus" size={18} /> Nouvelle recette
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5E9DA] flex items-center justify-center">
          <IconFactory name="Recipes" size={24} className="text-[#C9A227]" />
        </div>
        <h3 className="font-serif text-lg font-bold text-[#2C2419] mb-2">Aucune recette cree</h3>
        <p className="text-sm text-[#8C735A] mb-4">Definissez les compositions de vos produits</p>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white text-sm font-medium rounded-xl shadow-lg shadow-[#C9A227]/20 hover:from-[#C9A227] hover:to-[#B89219] transition-all">
          Creer une recette
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="font-serif text-xl font-bold text-[#2C2419] mb-1">Nouvelle recette</h2>
            <p className="text-sm text-[#8C735A] mb-6">Definissez la composition du produit</p>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2419] mb-1">Produit</label>
                <select className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm">
                  <option value="">Selectionner un produit</option>
                  <option value="1">Kunafa Fromage</option>
                  <option value="2">Kunafa Pistache</option>
                  <option value="3">Kunafa Nutella</option>
                </select>
              </div>
              <div className="p-4 bg-[#FAF3EB] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#2C2419]">Ingredient 1</span>
                  <button type="button" className="text-red-400 hover:text-red-600"><IconFactory name="Delete" size={16} /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#6B4F3A] mb-1">Ingredient</label>
                    <select className="w-full px-3 py-2 bg-white border border-[#E8D5C4] rounded-lg text-sm"><option value="">Selectionner</option><option value="1">Pâte Kunafa</option><option value="2">Fromage</option><option value="3">Pistache</option></select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B4F3A] mb-1">Quantite</label>
                    <input type="number" min="0" step="0.01" className="w-full px-3 py-2 bg-white border border-[#E8D5C4] rounded-lg text-sm" />
                  </div>
                </div>
              </div>
              <button type="button" className="w-full py-2.5 border border-dashed border-[#C9A227] text-[#C9A227] rounded-xl text-sm font-medium hover:bg-[#F5E9DA] transition-all">
                <IconFactory name="Plus" size={16} className="inline mr-2" /> Ajouter un ingredient
              </button>
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
