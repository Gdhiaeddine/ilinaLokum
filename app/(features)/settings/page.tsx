'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('Kunafa Boutique')

  function handleSave() {
    toast.success('Parametres sauvegardes')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#2C2419] mb-1">Parametres</h1>
        <p className="text-sm text-[#8C735A]">Configurez votre application</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow space-y-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#2C2419] mb-4">Informations du Magasin</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2C2419] mb-1">Nom du magasin</label>
              <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-4 py-2.5 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
          </div>
        </div>

        <div className="h-px bg-[#E8D5C4]" />

        <div>
          <h2 className="font-serif text-lg font-bold text-[#2C2419] mb-4">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2C2419] mb-1">Devise</label>
              <input value="DZD (Dinar Algerien)" disabled className="w-full px-4 py-2.5 bg-gray-100 border border-[#E8D5C4] rounded-xl text-sm text-[#6B4F3A] cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div className="h-px bg-[#E8D5C4]" />

        <div>
          <h2 className="font-serif text-lg font-bold text-[#2C2419] mb-4">Securite</h2>
          <button className="px-5 py-2.5 border border-[#E8D5C4] text-[#6B4F3A] rounded-xl text-sm font-medium hover:bg-[#FAF3EB] transition-all">
            Changer le mot de passe
          </button>
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-sm font-medium hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20">
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}
