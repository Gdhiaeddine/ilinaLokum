"use server";

import { createClient } from "@/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function getReportsData(period: 'daily' | 'weekly' | 'monthly' | 'custom', customStart?: string, customEnd?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: allSales } = await supabase
    .from("sales")
    .select("id, total_amount, date")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  const { data: allExpenses } = await supabase
    .from("expenses")
    .select("id, amount, date, description")
    .eq("user_id", user.id);

  const { data: allPurchases } = await supabase
    .from("purchase_orders")
    .select("id, total_amount, date, suppliers(name)")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  const sales = allSales ?? [];
  const expenses = allExpenses ?? [];
  const purchases = allPurchases ?? [];

  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  const chartDataList: { label: string; revenue: number; purchases: number; expenses: number; profit: number }[] = [];

  if (period === 'daily') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const periodSales = sales.filter(s => { const sd = new Date(s.date); return sd >= startDate && sd <= endDate; });
    const periodExpenses = expenses.filter(e => { const ed = new Date(e.date); return ed >= startDate && ed <= endDate; });
    const periodPurchases = purchases.filter(p => { const pd = new Date(p.date); return pd >= startDate && pd <= endDate; });

    for (let h = 0; h < 24; h++) {
      const hStart = new Date(startDate);
      hStart.setHours(h, 0, 0, 0);
      const hEnd = new Date(startDate);
      hEnd.setHours(h, 59, 59, 999);
      const hourSales = periodSales.filter(s => { const sd = new Date(s.date); return sd >= hStart && sd <= hEnd; });
      const hourExpenses = periodExpenses.filter(e => { const ed = new Date(e.date); return ed >= hStart && ed <= hEnd; });
      const hourPurchases = periodPurchases.filter(p => { const pd = new Date(p.date); return pd >= hStart && pd <= hEnd; });
      const revenue = hourSales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
      const exp = hourExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
      const pur = hourPurchases.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
      chartDataList.push({ label: `${h.toString().padStart(2, '0')}h`, revenue, purchases: pur, expenses: exp, profit: revenue - pur - exp });
    }
  } else if (period === 'weekly') {
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    for (let i = 0; i < 7; i++) {
      const dStart = new Date(startDate);
      dStart.setDate(dStart.getDate() + i);
      const dEnd = new Date(dStart);
      dEnd.setHours(23, 59, 59, 999);
      const daySales = sales.filter(s => { const sd = new Date(s.date); return sd >= dStart && sd <= dEnd; });
      const dayExpenses = expenses.filter(e => { const ed = new Date(e.date); return ed >= dStart && ed <= dEnd; });
      const dayPurchases = purchases.filter(p => { const pd = new Date(p.date); return pd >= dStart && pd <= dEnd; });
      const revenue = daySales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
      const exp = dayExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
      const pur = dayPurchases.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
      chartDataList.push({ label: dayNames[i], revenue, purchases: pur, expenses: exp, profit: revenue - pur - exp });
    }
  } else if (period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const daysInMonth = endDate.getDate();
    const weeksCount = Math.ceil(daysInMonth / 7);
    for (let w = 0; w < weeksCount; w++) {
      const wStart = new Date(startDate);
      wStart.setDate(wStart.getDate() + w * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(Math.min(wStart.getDate() + 6, daysInMonth));
      wEnd.setHours(23, 59, 59, 999);
      const weekSales = sales.filter(s => { const sd = new Date(s.date); return sd >= wStart && sd <= wEnd; });
      const weekExpenses = expenses.filter(e => { const ed = new Date(e.date); return ed >= wStart && ed <= wEnd; });
      const weekPurchases = purchases.filter(p => { const pd = new Date(p.date); return pd >= wStart && pd <= wEnd; });
      const revenue = weekSales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
      const exp = weekExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
      const pur = weekPurchases.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
      chartDataList.push({ label: `S${w + 1}`, revenue, purchases: pur, expenses: exp, profit: revenue - pur - exp });
    }
  } else {
    if (!customStart || !customEnd) return null;
    startDate = new Date(customStart);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(customEnd);
    endDate.setHours(23, 59, 59, 999);

    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays <= 1) {
      for (let h = 0; h < 24; h++) {
        const hStart = new Date(startDate);
        hStart.setHours(h, 0, 0, 0);
        const hEnd = new Date(startDate);
        hEnd.setHours(h, 59, 59, 999);
        const hourSales = sales.filter(s => { const sd = new Date(s.date); return sd >= hStart && sd <= hEnd; });
        const hourExpenses = expenses.filter(e => { const ed = new Date(e.date); return ed >= hStart && ed <= hEnd; });
        const hourPurchases = purchases.filter(p => { const pd = new Date(p.date); return pd >= hStart && pd <= hEnd; });
        const revenue = hourSales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
        const exp = hourExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
        const pur = hourPurchases.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
        chartDataList.push({ label: `${h.toString().padStart(2, '0')}h`, revenue, purchases: pur, expenses: exp, profit: revenue - pur - exp });
      }
    } else if (diffDays <= 31) {
      const current = new Date(startDate);
      while (current <= endDate) {
        const dStart = new Date(current);
        const dEnd = new Date(current);
        dEnd.setHours(23, 59, 59, 999);
        const daySales = sales.filter(s => { const sd = new Date(s.date); return sd >= dStart && sd <= dEnd; });
        const dayExpenses = expenses.filter(e => { const ed = new Date(e.date); return ed >= dStart && ed <= dEnd; });
        const dayPurchases = purchases.filter(p => { const pd = new Date(p.date); return pd >= dStart && pd <= dEnd; });
        const revenue = daySales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
        const exp = dayExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
        const pur = dayPurchases.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
        const label = current.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        chartDataList.push({ label, revenue, purchases: pur, expenses: exp, profit: revenue - pur - exp });
        current.setDate(current.getDate() + 1);
      }
    } else {
      const current = new Date(startDate);
      while (current <= endDate) {
        const wStart = new Date(current);
        const wEnd = new Date(current);
        wEnd.setDate(wEnd.getDate() + 6);
        if (wEnd > endDate) wEnd.setTime(endDate.getTime());
        wEnd.setHours(23, 59, 59, 999);
        const weekSales = sales.filter(s => { const sd = new Date(s.date); return sd >= wStart && sd <= wEnd; });
        const weekExpenses = expenses.filter(e => { const ed = new Date(e.date); return ed >= wStart && ed <= wEnd; });
        const weekPurchases = purchases.filter(p => { const pd = new Date(p.date); return pd >= wStart && pd <= wEnd; });
        const revenue = weekSales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
        const exp = weekExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
        const pur = weekPurchases.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
        const label = `${wStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${wEnd.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`;
        chartDataList.push({ label, revenue, purchases: pur, expenses: exp, profit: revenue - pur - exp });
        current.setDate(current.getDate() + 7);
      }
    }
  }

  const periodExpenses = expenses.filter(e => { const ed = new Date(e.date); return ed >= startDate && ed <= endDate; });
  const periodPurchases = purchases.filter(p => { const pd = new Date(p.date); return pd >= startDate && pd <= endDate; });
  const periodSales = sales.filter(s => { const sd = new Date(s.date); return sd >= startDate && sd <= endDate; });

  const totalRevenue = periodSales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
  const totalExpenses = periodExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalPurchases = periodPurchases.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
  const totalProfit = totalRevenue - totalPurchases - totalExpenses;

  const supplierTotals: Record<string, { name: string; total: number }> = {};
  for (const p of periodPurchases) {
    const name = (p as any).suppliers?.name || "Inconnu";
    if (!supplierTotals[name]) supplierTotals[name] = { name, total: 0 };
    supplierTotals[name].total += Number(p.total_amount) || 0;
  }
  const topSuppliers = Object.values(supplierTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    chartData: chartDataList,
    totalRevenue,
    totalProfit,
    totalExpenses,
    totalPurchases,
    topSuppliers,
    purchases: periodPurchases.map(p => ({
      id: p.id,
      supplier: (p as any).suppliers?.name || '-',
      total: Number(p.total_amount),
      date: new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    })),
    expenses: periodExpenses.map(e => ({
      id: e.id,
      description: e.description,
      amount: Number(e.amount),
      date: new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    })),
  };
}

export async function getDailyReportData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const { data: sales } = await supabase
    .from("sales")
    .select("id, total_amount, date")
    .eq("user_id", user.id)
    .gte("date", todayStart.toISOString())
    .lte("date", todayEnd.toISOString());

  const { data: purchases } = await supabase
    .from("purchase_orders")
    .select("id, total_amount, date, suppliers(name)")
    .eq("user_id", user.id)
    .gte("date", todayStart.toISOString())
    .lte("date", todayEnd.toISOString());

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", todayStart.toISOString())
    .lte("date", todayEnd.toISOString());

  const salesList = sales ?? [];
  const purchasesList = purchases ?? [];
  const expensesList = expenses ?? [];

  const totalRevenue = salesList.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
  const totalPurchases = purchasesList.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
  const totalExpenses = expensesList.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalProfit = totalRevenue - totalPurchases - totalExpenses;

  return {
    date: todayStart.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
    totalRevenue,
    totalPurchases,
    totalExpenses,
    totalProfit,
    purchases: purchasesList.map(p => ({
      id: p.id,
      supplier: (p as any).suppliers?.name || '-',
      total: Number(p.total_amount),
      date: new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    })),
    expenses: expensesList.map(e => ({
      id: e.id,
      description: e.description,
      amount: Number(e.amount),
      date: new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    })),
  };
}

export async function getRangeReportData(startDateStr: string, endDateStr: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  const { data: sales } = await supabase
    .from("sales")
    .select("id, total_amount, date")
    .eq("user_id", user.id)
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString())
    .order("date", { ascending: true });

  const { data: purchases } = await supabase
    .from("purchase_orders")
    .select("id, total_amount, date, suppliers(name)")
    .eq("user_id", user.id)
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString())
    .order("date", { ascending: true });

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString())
    .order("date", { ascending: true });

  const salesList = sales ?? [];
  const purchasesList = purchases ?? [];
  const expensesList = expenses ?? [];

  const days: { date: string; label: string; revenue: number; purchases: number; expenses: number; profit: number }[] = [];

  const current = new Date(startDate);
  while (current <= endDate) {
    const dayStr = current.toISOString().split('T')[0];
    const label = current.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
    const dayStart = new Date(current);
    const dayEnd = new Date(current);
    dayEnd.setHours(23, 59, 59, 999);

    const revenue = salesList
      .filter(s => { const sd = new Date(s.date); return sd >= dayStart && sd <= dayEnd; })
      .reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
    const pur = purchasesList
      .filter(p => { const pd = new Date(p.date); return pd >= dayStart && pd <= dayEnd; })
      .reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
    const exp = expensesList
      .filter(e => { const ed = new Date(e.date); return ed >= dayStart && ed <= dayEnd; })
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    days.push({
      date: dayStr,
      label,
      revenue,
      purchases: pur,
      expenses: exp,
      profit: revenue - pur - exp,
    });

    current.setDate(current.getDate() + 1);
  }

  const totalRevenue = salesList.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
  const totalPurchases = purchasesList.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
  const totalExpenses = expensesList.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalProfit = totalRevenue - totalPurchases - totalExpenses;

  const supplierTotals: Record<string, { name: string; total: number }> = {};
  for (const p of purchasesList) {
    const name = (p as any).suppliers?.name || "Inconnu";
    if (!supplierTotals[name]) supplierTotals[name] = { name, total: 0 };
    supplierTotals[name].total += Number(p.total_amount) || 0;
  }
  const topSuppliers = Object.values(supplierTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    days,
    totalRevenue,
    totalPurchases,
    totalExpenses,
    totalProfit,
    topSuppliers,
    purchases: purchasesList.map(p => ({
      id: p.id,
      supplier: (p as any).suppliers?.name || '-',
      total: Number(p.total_amount),
      date: new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    })),
    expenses: expensesList.map(e => ({
      id: e.id,
      description: e.description,
      amount: Number(e.amount),
      date: new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    })),
  };
}

export async function getDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: allSales, error: salesError } = await supabase
    .from("sales")
    .select("*, sale_items(*, products(name))")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (salesError) console.error("Sales error:", salesError);

  const { data: allProducts, error: productsError } = await supabase
    .from("products")
    .select("id, name, current_stock, min_stock, unit")
    .eq("user_id", user.id);

  if (productsError) console.error("Products error:", productsError);

  const { data: allPurchases } = await supabase
    .from("purchase_orders")
    .select("id, total_amount, date, suppliers(name)")
    .eq("user_id", user.id);

  const { data: allExpenses } = await supabase
    .from("expenses")
    .select("id, amount, date")
    .eq("user_id", user.id);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = monthStart;

  const sumPurchases = (start: Date, end: Date) =>
    (allPurchases ?? []).reduce((acc, p) => {
      const pd = new Date(p.date);
      return pd >= start && pd < end ? acc + (Number(p.total_amount) || 0) : acc;
    }, 0);

  const sumExpenses = (start: Date, end: Date) =>
    (allExpenses ?? []).reduce((acc, e) => {
      const ed = new Date(e.date);
      return ed >= start && ed < end ? acc + (Number(e.amount) || 0) : acc;
    }, 0);

  const sales = allSales ?? [];
  const todaySales = sales.filter(s => new Date(s.date) >= todayStart);
  const yesterdaySales = sales.filter(s => new Date(s.date) >= yesterdayStart && new Date(s.date) < todayStart);

  const lowStock = (allProducts ?? [])
    .filter(p => Number(p.current_stock) <= Number(p.min_stock))
    .sort((a, b) => Number(a.current_stock) - Number(b.current_stock));

  let todayRevenue = 0;
  for (const sale of todaySales) {
    todayRevenue += Number(sale.total_amount) || 0;
  }

  let yesterdayRevenue = 0;
  for (const sale of yesterdaySales) {
    yesterdayRevenue += Number(sale.total_amount) || 0;
  }

  const todayPurchases = sumPurchases(todayStart, new Date(todayStart.getTime() + 24 * 60 * 60 * 1000));
  const todayExpenses = sumExpenses(todayStart, new Date(todayStart.getTime() + 24 * 60 * 60 * 1000));
  const todayProfit = todayRevenue - (todayPurchases + todayExpenses);

  const yesterdayEnd = new Date(todayStart);
  const yesterdayPurchases = sumPurchases(yesterdayStart, yesterdayEnd);
  const yesterdayExpenses = sumExpenses(yesterdayStart, yesterdayEnd);
  const yesterdayProfit = yesterdayRevenue - (yesterdayPurchases + yesterdayExpenses);

  const monthRevenue = sales
    .filter(s => { const sd = new Date(s.date); return sd >= monthStart && sd < monthEnd; })
    .reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);
  const prevMonthRevenue = sales
    .filter(s => { const sd = new Date(s.date); return sd >= prevMonthStart && sd < prevMonthEnd; })
    .reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0);

  const monthPurchasesExpenses = sumPurchases(monthStart, monthEnd) + sumExpenses(monthStart, monthEnd);
  const prevMonthPurchasesExpenses = sumPurchases(prevMonthStart, prevMonthEnd) + sumExpenses(prevMonthStart, prevMonthEnd);

  const revenueChange = yesterdayRevenue > 0 ? (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(0) : "0";
  const profitChange = yesterdayProfit > 0 ? (((todayProfit - yesterdayProfit) / yesterdayProfit) * 100).toFixed(0) : (todayProfit > 0 ? "100" : "0");
  const monthRevenueChange = prevMonthRevenue > 0 ? (((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(0) : "0";
  const monthPurchasesChange = prevMonthPurchasesExpenses > 0 ? (((monthPurchasesExpenses - prevMonthPurchasesExpenses) / prevMonthPurchasesExpenses) * 100).toFixed(0) : "0";

  const weeklyData: { day: string; revenue: number; profit: number }[] = [];
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const daySales = sales.filter(s => {
      const sd = new Date(s.date);
      return sd >= d && sd < nextD;
    });

    let dayRevenue = 0;
    for (const sale of daySales) {
      dayRevenue += Number(sale.total_amount) || 0;
    }
    const dayPurchases = sumPurchases(d, nextD);
    const dayExpenses = sumExpenses(d, nextD);
    const dayProfit = dayRevenue - (dayPurchases + dayExpenses);

    weeklyData.push({ day: dayNames[d.getDay()], revenue: dayRevenue, profit: dayProfit });
  }

  const supplierTotals: Record<string, { name: string; total: number }> = {};
  for (const purchase of (allPurchases ?? [])) {
    const pd = new Date(purchase.date);
    if (pd < monthStart || pd >= monthEnd) continue;
    const supplierName = (purchase as any).suppliers?.name || "Inconnu";
    if (!supplierTotals[supplierName]) {
      supplierTotals[supplierName] = { name: supplierName, total: 0 };
    }
    supplierTotals[supplierName].total += Number(purchase.total_amount) || 0;
  }
  const topSuppliers = Object.values(supplierTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const expensesByDayMap: Record<string, number> = {};
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const key = `${String(i).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    expensesByDayMap[key] = 0;
  }
  for (const expense of (allExpenses ?? [])) {
    const ed = new Date(expense.date);
    if (ed < monthStart || ed >= monthEnd) continue;
    const key = `${String(ed.getDate()).padStart(2, "0")}/${String(ed.getMonth() + 1).padStart(2, "0")}`;
    expensesByDayMap[key] = (expensesByDayMap[key] || 0) + (Number(expense.amount) || 0);
  }
  const monthExpensesByDay = Object.entries(expensesByDayMap).map(([day, amount]) => ({ day, amount }));

  const recentSales = todaySales
    .slice(0, 5)
    .map(sale => {
      const date = new Date(sale.date);
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      let timeLabel = "";
      if (diffMin < 1) timeLabel = "A l'instant";
      else if (diffMin < 60) timeLabel = `Il y a ${diffMin} min`;
      else timeLabel = `Il y a ${diffHr}h`;

      return {
        id: sale.id,
        total: Number(sale.total_amount),
        time: timeLabel,
      };
    });

  return {
    todayRevenue,
    todayProfit,
    revenueChange: Number(revenueChange),
    profitChange: Number(profitChange),
    monthRevenue,
    monthRevenueChange: Number(monthRevenueChange),
    monthPurchasesExpenses,
    monthPurchasesChange: Number(monthPurchasesChange),
    todayPurchases,
    todayExpenses,
    lowStock,
    weeklyData,
    topSuppliers,
    monthExpensesByDay,
    recentSales,
  };
}

export async function getSales() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("sales")
    .select("*, sale_items(*, products(name))")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getSalesByDate(date: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const startOfDay = `${date}T00:00:00`;
  const endOfDay = `${date}T23:59:59`;

  const { data, error } = await supabase
    .from("sales")
    .select("*, sale_items(*, products(name))")
    .eq("user_id", user.id)
    .gte("date", startOfDay)
    .lte("date", endOfDay)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createSale(saleDate: string, totalAmount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const startOfDay = `${saleDate}T00:00:00`;
  const endOfDay = `${saleDate}T23:59:59`;

  await supabase
    .from("sales")
    .delete()
    .eq("user_id", user.id)
    .gte("date", startOfDay)
    .lte("date", endOfDay);

  const { error } = await supabase.from("sales").insert({
    total_amount: totalAmount,
    date: new Date(saleDate).toISOString(),
    user_id: user.id,
  });

  if (error) throw error;

  revalidatePath("/sales");
  revalidatePath("/dashboard");
}

export async function resetDaySales(saleDate: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const startOfDay = `${saleDate}T00:00:00`;
  const endOfDay = `${saleDate}T23:59:59`;

  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("user_id", user.id)
    .gte("date", startOfDay)
    .lte("date", endOfDay);

  if (error) throw error;

  revalidatePath("/sales");
  revalidatePath("/dashboard");
}
