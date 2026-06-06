'use client'

import { useState, useEffect } from 'react'
import { IconFactory } from '@/shared/icon-factory'

interface PurchaseItem {
  id?: string
  product_id: string
  quantity: number
  unit_price: number
  products?: { name: string; unit?: string } | null
}

interface PurchaseDetails {
  id: string
  date: string
  total_amount: number
  image_url: string | null
  suppliers?: { name: string } | null
  purchase_items: PurchaseItem[]
}

interface PurchaseDetailsModalProps {
  purchase: PurchaseDetails | null
  onClose: () => void
}

export function PurchaseDetailsModal({ purchase, onClose }: PurchaseDetailsModalProps) {
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (!purchase) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomed) setZoomed(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [purchase, zoomed, onClose])

  if (!purchase) return null

  const purchaseDate = new Date(purchase.date)
  const formattedDate = purchaseDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const formattedTime = purchaseDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const items = purchase.purchase_items ?? []

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-[#E8D5C4]/50 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#2C2419]">
                Détails de l&apos;achat
              </h2>
              <p className="text-sm text-[#8C735A] mt-0.5">
                <span className="capitalize">{formattedDate}</span> · {formattedTime}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#8C735A] hover:text-[#2C2419] hover:bg-[#FAF3EB] rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <IconFactory name="Close" size={20} />
            </button>
          </div>

          <div className="overflow-y-auto p-6 space-y-6">
            <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-[#F5E9DA] to-[#FAF3EB] rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center flex-shrink-0">
                <IconFactory name="Suppliers" className="text-white" size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#8C735A] uppercase tracking-wider">Fournisseur</p>
                <p className="font-medium text-[#2C2419]">{purchase.suppliers?.name || '-'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#2C2419] mb-3">
                Articles ({items.length})
              </h3>
              {items.length === 0 ? (
                <p className="text-sm text-[#8C735A] italic">Aucun article</p>
              ) : (
                <div className="border border-[#E8D5C4]/50 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#FAF3EB]">
                      <tr>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Produit</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Quantité</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">P.U.</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#6B4F3A] uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8D5C4]/50">
                      {items.map((item, i) => {
                        const lineTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
                        return (
                          <tr key={item.id ?? i}>
                            <td className="px-4 py-3 text-[#2C2419]">
                              {item.products?.name || 'Produit'}
                              {item.products?.unit && (
                                <span className="text-xs text-[#8C735A] ml-1">({item.products.unit})</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-[#6B4F3A]">
                              {item.quantity} {item.products?.unit || ''}
                            </td>
                            <td className="px-4 py-3 text-right text-[#6B4F3A]">
                              {Number(item.unit_price).toFixed(2)} DA
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-[#2C2419]">
                              {lineTotal.toFixed(2)} DA
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F5E9DA] to-[#FAF3EB] rounded-xl">
              <span className="font-medium text-[#2C2419]">Total</span>
              <span className="font-serif text-2xl font-bold text-[#C9A227]">
                {Number(purchase.total_amount).toFixed(2)} DA
              </span>
            </div>

            {purchase.image_url ? (
              <div>
                <h3 className="text-sm font-semibold text-[#2C2419] mb-3">Justificatif</h3>
                <button
                  type="button"
                  onClick={() => setZoomed(true)}
                  className="block w-full overflow-hidden rounded-xl border border-[#E8D5C4]/50 bg-[#FAF3EB] group relative"
                >
                  <img
                    src={purchase.image_url}
                    alt="Justificatif d'achat"
                    className="w-full h-auto max-h-80 object-contain bg-[#FAF3EB]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-3 py-1.5 bg-white/90 rounded-lg text-sm font-medium text-[#2C2419]">
                      <IconFactory name="Eye" size={16} /> Agrandir
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="text-sm text-[#8C735A] italic">Aucun justificatif attaché</div>
            )}
          </div>
        </div>
      </div>

      {zoomed && purchase.image_url && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setZoomed(false)}
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <IconFactory name="Close" size={24} />
          </button>
          <img
            src={purchase.image_url}
            alt="Justificatif d'achat"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
