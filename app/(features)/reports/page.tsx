'use client'

import { useState, useMemo } from 'react'
import { IconFactory } from '@/shared/icon-factory'
import { useQuery } from '@tanstack/react-query'
import { getReportsData, getDailyReportData, getRangeReportData } from '@/app/actions/sales'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORS = ['#D4AF37', '#C9A227', '#A67C00', '#8C735A', '#6B4F3A']

export default function ReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [appliedStart, setAppliedStart] = useState('')
  const [appliedEnd, setAppliedEnd] = useState('')
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [isExportingCharges, setIsExportingCharges] = useState(false)
  const [isExportingVentes, setIsExportingVentes] = useState(false)

  const customApplied = appliedStart !== '' && appliedEnd !== ''

  const periodLabels: Record<string, string> = {
    daily: `Aujourd'hui`,
    weekly: `Cette semaine`,
    monthly: `Ce mois`,
    custom: customApplied ? `${new Date(appliedStart).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${new Date(appliedEnd).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'Intervalle',
  }

  function applyCustomRange() {
    if (customStart && customEnd) {
      setAppliedStart(customStart)
      setAppliedEnd(customEnd)
    }
  }

  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)
  const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset + 6)

  const { data, isLoading } = useQuery({
    queryKey: ['reports', period, appliedStart, appliedEnd],
    queryFn: () => getReportsData(period, appliedStart, appliedEnd),
    enabled: period !== 'custom' || customApplied,
  })

  const { data: dailyReport } = useQuery({
    queryKey: ['daily-report'],
    queryFn: getDailyReportData,
    enabled: period === 'daily',
  })

  const now2 = new Date()
  const dayOfWeek2 = now2.getDay()
  const mondayOffset2 = dayOfWeek2 === 0 ? -6 : 1 - dayOfWeek2
  const rangeStart = period === 'weekly'
    ? new Date(now2.getFullYear(), now2.getMonth(), now2.getDate() + mondayOffset2)
    : period === 'monthly'
    ? new Date(now2.getFullYear(), now2.getMonth(), 1)
    : period === 'custom' && customApplied
    ? new Date(appliedStart)
    : now2
  const rangeEnd = period === 'weekly'
    ? new Date(now2.getFullYear(), now2.getMonth(), now2.getDate() + mondayOffset2 + 6)
    : period === 'monthly'
    ? new Date(now2.getFullYear(), now2.getMonth() + 1, 0)
    : period === 'custom' && customApplied
    ? new Date(appliedEnd)
    : now2

  const { data: rangeReport } = useQuery({
    queryKey: ['range-report', period, appliedStart, appliedEnd],
    queryFn: () => getRangeReportData(rangeStart.toISOString(), rangeEnd.toISOString()),
    enabled: period !== 'daily' && (period !== 'custom' || customApplied),
  })

  const chartData = useMemo(() => {
    if (!data) return []
    return data.chartData.map(d => ({
      name: d.label,
      revenue: d.revenue,
      profit: d.profit,
      charges: d.purchases + d.expenses,
    }))
  }, [data])

  function groupByDateWithTotals<T extends { date: string }>(
    items: T[],
    cols: (item: T) => string[],
    totalCol: (item: T) => number,
    colCount: number
  ): { row: string[]; isSubtotal: boolean; dayTotal: number }[] {
    const map = new Map<string, T[]>()
    for (const item of items) {
      const key = item.date
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }

    const result: { row: string[]; isSubtotal: boolean; dayTotal: number }[] = []
    for (const [date, group] of map) {
      let daySum = 0
      for (const item of group) {
        daySum += totalCol(item)
        const row = cols(item)
        row[colCount - 1] = `${totalCol(item).toFixed(2)} DA`
        result.push({ row, isSubtotal: false, dayTotal: 0 })
      }
      const subtotal = new Array(colCount).fill('')
      subtotal[0] = `Total ${date}`
      subtotal[colCount - 1] = `${daySum.toFixed(2)} DA`
      result.push({ row: subtotal, isSubtotal: true, dayTotal: daySum })
    }
    return result
  }

  async function exportPdf() {
    setIsExportingPdf(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      const titleMap: Record<string, string> = {
        daily: 'Rapport Journalier',
        weekly: 'Rapport Hebdomadaire',
        monthly: 'Rapport Mensuel',
        custom: 'Rapport Personnalise',
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(44, 36, 25)
      doc.text(titleMap[period], pageWidth / 2, 20, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(140, 115, 90)
      doc.text(periodLabels[period], pageWidth / 2, 28, { align: 'center' })

      let yPos = 40

      const report = period === 'daily' ? dailyReport : rangeReport

      if (report) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.setTextColor(44, 36, 25)
        doc.text('Resume Financier', 14, yPos)
        yPos += 4

        autoTable(doc, {
          startY: yPos,
          body: [
            ['Periode', periodLabels[period]],
            ['Chiffre d\'affaires', `${report.totalRevenue.toFixed(2)} DA`],
            ['Total Achats', `${report.totalPurchases.toFixed(2)} DA`],
            ['Total Depenses', `${report.totalExpenses.toFixed(2)} DA`],
            ['Total Charges', `${(report.totalPurchases + report.totalExpenses).toFixed(2)} DA`],
            ['Benefice net', `${report.totalProfit.toFixed(2)} DA`],
          ],
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 5 },
          columnStyles: { 0: { cellWidth: 90, fontStyle: 'bold', textColor: [107, 79, 58] }, 1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' } },
          didParseCell: function(data: any) {
            if (data.row.index === 5 && data.column.index === 1) {
              const val = parseFloat((data.cell.raw as string).replace(/[^\d.-]/g, ''))
              data.cell.styles.textColor = val >= 0 ? [44, 122, 44] : [220, 50, 50]
              data.cell.styles.fontSize = 12
            }
          },
        })
        yPos = (doc as any).lastAutoTable.finalY + 10
      }

      if (yPos > 240) { doc.addPage(); yPos = 20 }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(44, 36, 25)
      doc.text('Achats', 14, yPos)
      yPos += 4

      if (report && report.purchases.length > 0) {
        const groupedP = groupByDateWithTotals(report.purchases, (p) => [p.date, p.supplier, ''], (p) => p.total, 3)
        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Fournisseur', 'Total (DA)']],
          body: groupedP.map((g) => g.row),
          foot: [['', 'Total', `${report.totalPurchases.toFixed(2)} DA`]],
          theme: 'grid',
          headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
          footStyles: { fillColor: [245, 233, 218], textColor: [44, 36, 25], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 4 },
          columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 85 }, 2: { cellWidth: 35, halign: 'right' } },
          didParseCell: function(data: any) {
            const item = groupedP[data.row.index]
            if (item?.isSubtotal) {
              data.cell.styles.fontStyle = 'bold'
              data.cell.styles.fillColor = [240, 230, 210]
            }
          },
        })
        yPos = (doc as any).lastAutoTable.finalY + 10
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(140, 115, 90)
        doc.text('Aucun achat pour cette periode', 14, yPos + 5)
        yPos += 15
      }

      if (yPos > 240) { doc.addPage(); yPos = 20 }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(44, 36, 25)
      doc.text('Depenses', 14, yPos)
      yPos += 4

      if (report && report.expenses.length > 0) {
        const groupedE = groupByDateWithTotals(report.expenses, (e) => [e.date, e.description, ''], (e) => e.amount, 3)
        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Description', 'Montant (DA)']],
          body: groupedE.map((g) => g.row),
          foot: [['', 'Total', `${report.totalExpenses.toFixed(2)} DA`]],
          theme: 'grid',
          headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
          footStyles: { fillColor: [245, 233, 218], textColor: [44, 36, 25], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 4 },
          columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 85 }, 2: { cellWidth: 35, halign: 'right' } },
          didParseCell: function(data: any) {
            const item = groupedE[data.row.index]
            if (item?.isSubtotal) {
              data.cell.styles.fontStyle = 'bold'
              data.cell.styles.fillColor = [240, 230, 210]
            }
          },
        })
        yPos = (doc as any).lastAutoTable.finalY + 10
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(140, 115, 90)
        doc.text('Aucune depense pour cette periode', 14, yPos + 5)
        yPos += 15
      }

      if (yPos > 240) { doc.addPage(); yPos = 20 }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(44, 36, 25)
      doc.text('Ventes', 14, yPos)
      yPos += 4

      if (report && report.sales.length > 0) {
        const groupedS = groupByDateWithTotals(report.sales, (s) => [s.date, ''], (s) => s.total, 2)
        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Montant (DA)']],
          body: groupedS.map((g) => g.row),
          foot: [['', `Total: ${report.totalRevenue.toFixed(2)} DA`]],
          theme: 'grid',
          headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
          footStyles: { fillColor: [245, 233, 218], textColor: [44, 36, 25], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 4 },
          columnStyles: { 0: { cellWidth: 85 }, 1: { cellWidth: 85, halign: 'right' } },
          didParseCell: function(data: any) {
            const item = groupedS[data.row.index]
            if (item?.isSubtotal) {
              data.cell.styles.fontStyle = 'bold'
              data.cell.styles.fillColor = [240, 230, 210]
            }
          },
        })
        yPos = (doc as any).lastAutoTable.finalY + 10
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(140, 115, 90)
        doc.text('Aucune vente pour cette periode', 14, yPos + 5)
        yPos += 15
      }

      const filename = period === 'daily'
        ? `rapport-journalier-${now.toISOString().split('T')[0]}.pdf`
        : period === 'custom'
        ? `rapport-${appliedStart}-a-${appliedEnd}.pdf`
        : `rapport-${period}-${rangeStart.toISOString().split('T')[0]}-a-${rangeEnd.toISOString().split('T')[0]}.pdf`
      doc.save(filename)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setIsExportingPdf(false)
    }
  }

  async function exportCharges() {
    setIsExportingCharges(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      const titleMap: Record<string, string> = {
        daily: 'Depenses + Achats Journaliers',
        weekly: 'Depenses + Achats Hebdomadaires',
        monthly: 'Depenses + Achats Mensuels',
        custom: 'Depenses + Achats Personnalises',
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(44, 36, 25)
      doc.text(titleMap[period], pageWidth / 2, 20, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(140, 115, 90)
      doc.text(periodLabels[period], pageWidth / 2, 28, { align: 'center' })

      let yPos = 40

      const report = period === 'daily' ? dailyReport : rangeReport

      if (report) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.setTextColor(44, 36, 25)
        doc.text('Resume Financier', 14, yPos)
        yPos += 4

        autoTable(doc, {
          startY: yPos,
          body: [
            ['Periode', periodLabels[period]],
            ['Total Achats', `${report.totalPurchases.toFixed(2)} DA`],
            ['Total Depenses', `${report.totalExpenses.toFixed(2)} DA`],
            ['Total Charges', `${(report.totalPurchases + report.totalExpenses).toFixed(2)} DA`],
          ],
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 5 },
          columnStyles: { 0: { cellWidth: 90, fontStyle: 'bold', textColor: [107, 79, 58] }, 1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' } },
        })
        yPos = (doc as any).lastAutoTable.finalY + 10
      }

      if (yPos > 240) { doc.addPage(); yPos = 20 }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(44, 36, 25)
      doc.text('Achats', 14, yPos)
      yPos += 4

      if (report && report.purchases.length > 0) {
        const groupedP = groupByDateWithTotals(report.purchases, (p) => [p.date, p.supplier, ''], (p) => p.total, 3)
        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Fournisseur', 'Total (DA)']],
          body: groupedP.map((g) => g.row),
          foot: [['', 'Total', `${report.totalPurchases.toFixed(2)} DA`]],
          theme: 'grid',
          headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
          footStyles: { fillColor: [245, 233, 218], textColor: [44, 36, 25], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 4 },
          columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 85 }, 2: { cellWidth: 35, halign: 'right' } },
          didParseCell: function(data: any) {
            const item = groupedP[data.row.index]
            if (item?.isSubtotal) {
              data.cell.styles.fontStyle = 'bold'
              data.cell.styles.fillColor = [240, 230, 210]
            }
          },
        })
        yPos = (doc as any).lastAutoTable.finalY + 10
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(140, 115, 90)
        doc.text('Aucun achat pour cette periode', 14, yPos + 5)
        yPos += 15
      }

      if (yPos > 240) { doc.addPage(); yPos = 20 }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(44, 36, 25)
      doc.text('Depenses', 14, yPos)
      yPos += 4

      if (report && report.expenses.length > 0) {
        const groupedE = groupByDateWithTotals(report.expenses, (e) => [e.date, e.description, ''], (e) => e.amount, 3)
        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Description', 'Montant (DA)']],
          body: groupedE.map((g) => g.row),
          foot: [['', 'Total', `${report.totalExpenses.toFixed(2)} DA`]],
          theme: 'grid',
          headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
          footStyles: { fillColor: [245, 233, 218], textColor: [44, 36, 25], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 4 },
          columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 85 }, 2: { cellWidth: 35, halign: 'right' } },
          didParseCell: function(data: any) {
            const item = groupedE[data.row.index]
            if (item?.isSubtotal) {
              data.cell.styles.fontStyle = 'bold'
              data.cell.styles.fillColor = [240, 230, 210]
            }
          },
        })
        yPos = (doc as any).lastAutoTable.finalY + 10
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(140, 115, 90)
        doc.text('Aucune depense pour cette periode', 14, yPos + 5)
        yPos += 15
      }

      const filename = period === 'daily'
        ? `depenses-achats-journalier-${now.toISOString().split('T')[0]}.pdf`
        : period === 'custom'
        ? `depenses-achats-${appliedStart}-a-${appliedEnd}.pdf`
        : `depenses-achats-${period}-${rangeStart.toISOString().split('T')[0]}-a-${rangeEnd.toISOString().split('T')[0]}.pdf`
      doc.save(filename)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setIsExportingCharges(false)
    }
  }

  async function exportVentes() {
    setIsExportingVentes(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      const titleMap: Record<string, string> = {
        daily: 'Ventes Journalieres',
        weekly: 'Ventes Hebdomadaires',
        monthly: 'Ventes Mensuelles',
        custom: 'Ventes Personnalisees',
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(44, 36, 25)
      doc.text(titleMap[period], pageWidth / 2, 20, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(140, 115, 90)
      doc.text(periodLabels[period], pageWidth / 2, 28, { align: 'center' })

      let yPos = 40

      const report = period === 'daily' ? dailyReport : rangeReport

      if (report) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.setTextColor(44, 36, 25)
        doc.text('Resume', 14, yPos)
        yPos += 4

        autoTable(doc, {
          startY: yPos,
          body: [
            ['Periode', periodLabels[period]],
            ['Total Ventes', `${report.totalRevenue.toFixed(2)} DA`],
            ['Benefice net', `${report.totalProfit.toFixed(2)} DA`],
          ],
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 5 },
          columnStyles: { 0: { cellWidth: 90, fontStyle: 'bold', textColor: [107, 79, 58] }, 1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' } },
          didParseCell: function(data: any) {
            if (data.row.index === 2 && data.column.index === 1) {
              const val = parseFloat((data.cell.raw as string).replace(/[^\d.-]/g, ''))
              data.cell.styles.textColor = val >= 0 ? [44, 122, 44] : [220, 50, 50]
              data.cell.styles.fontSize = 12
            }
          },
        })
        yPos = (doc as any).lastAutoTable.finalY + 10
      }

      if (yPos > 240) { doc.addPage(); yPos = 20 }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(44, 36, 25)
      doc.text('Ventes', 14, yPos)
      yPos += 4

      if (report && report.sales.length > 0) {
        const groupedS = groupByDateWithTotals(report.sales, (s) => [s.date, ''], (s) => s.total, 2)
        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Montant (DA)']],
          body: groupedS.map((g) => g.row),
          foot: [['', `Total: ${report.totalRevenue.toFixed(2)} DA`]],
          theme: 'grid',
          headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
          footStyles: { fillColor: [245, 233, 218], textColor: [44, 36, 25], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 4 },
          columnStyles: { 0: { cellWidth: 85 }, 1: { cellWidth: 85, halign: 'right' } },
          didParseCell: function(data: any) {
            const item = groupedS[data.row.index]
            if (item?.isSubtotal) {
              data.cell.styles.fontStyle = 'bold'
              data.cell.styles.fillColor = [240, 230, 210]
            }
          },
        })
        yPos = (doc as any).lastAutoTable.finalY + 10
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(140, 115, 90)
        doc.text('Aucune vente pour cette periode', 14, yPos + 5)
        yPos += 15
      }

      const filename = period === 'daily'
        ? `ventes-journalieres-${now.toISOString().split('T')[0]}.pdf`
        : period === 'custom'
        ? `ventes-${appliedStart}-a-${appliedEnd}.pdf`
        : `ventes-${period}-${rangeStart.toISOString().split('T')[0]}-a-${rangeEnd.toISOString().split('T')[0]}.pdf`
      doc.save(filename)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setIsExportingVentes(false)
    }
  }

  if (period === 'custom' && !customApplied) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Rapports</h1>
            <p className="text-sm text-[#8C735A]">Selectionnez un intervalle de dates</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 p-1 bg-[#FAF3EB] rounded-xl">
              {(['daily', 'weekly', 'monthly', 'custom'] as const).map((p) => (
                <button key={p} onClick={() => { setPeriod(p); if (p !== 'custom') { setAppliedStart(''); setAppliedEnd('') } }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? 'bg-white text-[#C9A227] shadow-sm' : 'text-[#6B4F3A] hover:text-[#2C2419]'}`}>
                  {p === 'daily' ? 'Journalier' : p === 'weekly' ? 'Hebdomadaire' : p === 'monthly' ? 'Mensuel' : 'Intervalle'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 border border-[#E8D5C4] rounded-xl text-sm text-[#2C2419] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]"
              />
              <span className="text-sm text-[#8C735A]">au</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 border border-[#E8D5C4] rounded-xl text-sm text-[#2C2419] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]"
              />
              <button
                onClick={applyCustomRange}
                disabled={!customStart || !customEnd}
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-sm font-medium hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-12 text-center">
          <IconFactory name="Calendar" className="text-[#E8D5C4] mx-auto mb-4" size={48} />
          <p className="text-[#8C735A] text-sm">Veuillez selectionner une date de debut et une date de fin, puis cliquer sur Appliquer</p>
        </div>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-32 bg-[#E8D5C4]/50 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-[#E8D5C4]/50 rounded-lg animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-6">
              <div className="h-6 w-40 bg-[#E8D5C4]/50 rounded animate-pulse mb-6" />
              <div className="h-[300px] bg-[#E8D5C4]/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Rapports</h1>
          <p className="text-sm text-[#8C735A]">
            {period === 'daily'
              ? `Statistiques du ${now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`
              : period === 'weekly'
              ? `Statistiques de la semaine du ${weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} au ${weekEnd.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`
              : period === 'monthly'
              ? `Statistiques du mois de ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
              : customApplied
              ? `Statistiques du ${new Date(appliedStart).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} au ${new Date(appliedEnd).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`
              : 'Selectionnez un intervalle de dates'
            }
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 p-1 bg-[#FAF3EB] rounded-xl">
            {(['daily', 'weekly', 'monthly', 'custom'] as const).map((p) => (
              <button key={p} onClick={() => { setPeriod(p); if (p !== 'custom') { setAppliedStart(''); setAppliedEnd('') } }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? 'bg-white text-[#C9A227] shadow-sm' : 'text-[#6B4F3A] hover:text-[#2C2419]'}`}>
                {p === 'daily' ? 'Journalier' : p === 'weekly' ? 'Hebdomadaire' : p === 'monthly' ? 'Mensuel' : 'Intervalle'}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 border border-[#E8D5C4] rounded-xl text-sm text-[#2C2419] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]"
              />
              <span className="text-sm text-[#8C735A]">au</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 border border-[#E8D5C4] rounded-xl text-sm text-[#2C2419] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]"
              />
              <button
                onClick={applyCustomRange}
                disabled={!customStart || !customEnd}
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-sm font-medium hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Appliquer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
              <IconFactory name="DollarSign" className="text-white" size={18} />
            </div>
            <span className="text-sm font-medium text-[#6B4F3A]">Chiffre d'affaires</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#2C2419]">{data.totalRevenue.toFixed(2)} DA</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <IconFactory name="ShoppingCart" className="text-white" size={18} />
            </div>
            <span className="text-sm font-medium text-[#6B4F3A]">Achats</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#2C2419]">{data.totalPurchases.toFixed(2)} DA</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center">
              <IconFactory name="DollarSign" className="text-white" size={18} />
            </div>
            <span className="text-sm font-medium text-[#6B4F3A]">Depenses</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#2C2419]">{data.totalExpenses.toFixed(2)} DA</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8D5C4]/50 card-shadow p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.totalProfit >= 0 ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-gradient-to-br from-red-400 to-red-500'}`}>
              <IconFactory name="TrendingUp" className="text-white" size={18} />
            </div>
            <span className="text-sm font-medium text-[#6B4F3A]">Benefice net</span>
          </div>
          <p className={`font-serif text-2xl font-bold ${data.totalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {data.totalProfit >= 0 ? '+' : ''}{data.totalProfit.toFixed(2)} DA
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg font-bold text-[#2C2419]">Revenu et Benefice</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F5E9DA] text-[#C9A227]">{periodLabels[period]}</span>
          </div>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A227" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A227" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2C7A2C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2C7A2C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
                  <XAxis dataKey="name" tick={{ fill: '#6B4F3A', fontSize: 12 }} axisLine={{ stroke: '#E8D5C4' }} />
                  <YAxis tick={{ fill: '#6B4F3A', fontSize: 12 }} axisLine={{ stroke: '#E8D5C4' }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF3EB', border: '1px solid #E8D5C4', borderRadius: '12px' }}
                    formatter={(value: number, name: string) => [`${value.toFixed(2)} DA`, name === 'revenue' ? 'Revenu' : 'Benefice']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#C9A227" strokeWidth={3} fill="url(#revGradient)" name="revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#2C7A2C" strokeWidth={2} fill="url(#profGradient)" name="profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#8C735A]">
              <p className="text-sm">Aucune donnee pour cette periode</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg font-bold text-[#2C2419]">Top fournisseurs</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F5E9DA] text-[#C9A227]">{periodLabels[period]}</span>
          </div>
          {data.topSuppliers.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topSuppliers} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#2C2419', fontSize: 12, fontWeight: 500 }} axisLine={{ stroke: '#E8D5C4' }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF3EB', border: '1px solid #E8D5C4', borderRadius: '12px' }}
                    formatter={(val: number) => [`${val.toFixed(2)} DA` as any, 'Total']}
                    labelStyle={{ display: 'none' }}
                  />
                  <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={24}>
                    {data.topSuppliers.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#8C735A]">
              <p className="text-sm">Aucun fournisseur pour cette periode</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold text-[#2C2419]">Achats</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F5E9DA] text-[#C9A227]">{periodLabels[period]}</span>
          </div>
          {data.purchases.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {data.purchases.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-[#FAF3EB] rounded-xl">
                  <div>
                    <p className="font-medium text-[#2C2419] text-sm">{p.supplier}</p>
                    <p className="text-xs text-[#8C735A]">{p.date}</p>
                  </div>
                  <p className="font-bold text-[#2C2419] text-sm">{p.total.toFixed(2)} DA</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#8C735A]">
              <p className="text-sm">Aucun achat pour cette periode</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold text-[#2C2419]">Depenses</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F5E9DA] text-[#C9A227]">{periodLabels[period]}</span>
          </div>
          {data.expenses.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {data.expenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-[#FAF3EB] rounded-xl">
                  <div>
                    <p className="font-medium text-[#2C2419] text-sm">{e.description}</p>
                    <p className="text-xs text-[#8C735A]">{e.date}</p>
                  </div>
                  <p className="font-bold text-red-500 text-sm">-{e.amount.toFixed(2)} DA</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#8C735A]">
              <p className="text-sm">Aucune depense pour cette periode</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#E8D5C4]/50 card-shadow">
        <h2 className="font-serif text-lg font-bold text-[#2C2419] mb-4">Exportation</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportPdf}
            disabled={isExportingPdf || (period === 'daily' && !dailyReport) || (period !== 'daily' && !rangeReport)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-sm font-medium hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconFactory name="Download" size={16} /> {isExportingPdf ? 'Generation...' : 'Exporter PDF'}
          </button>
          <button
            onClick={exportCharges}
            disabled={isExportingCharges || (period === 'daily' && !dailyReport) || (period !== 'daily' && !rangeReport)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl text-sm font-medium hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconFactory name="Download" size={16} /> {isExportingCharges ? 'Generation...' : 'PDF Depenses + Achats'}
          </button>
          <button
            onClick={exportVentes}
            disabled={isExportingVentes || (period === 'daily' && !dailyReport) || (period !== 'daily' && !rangeReport)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconFactory name="Download" size={16} /> {isExportingVentes ? 'Generation...' : 'PDF Ventes'}
          </button>
        </div>
      </div>
    </div>
  )
}
