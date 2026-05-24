"use server";

import { createClient } from "@/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function getReportsData(period: 'daily' | 'weekly' | 'monthly' | 'custom', customStart?: string, customEnd?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: allSales } = await supabase
    .from("sales")
    .select("*, sale_items(*, products(name))")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  const { data: allProducts } = await supabase
    .from("products")
    .select("id, name, current_stock, min_stock, unit, selling_price, avg_price, production_cost")
    .eq("user_id", user.id);

  const { data: allExpenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id);

  const { data: allPurchases } = await supabase
    .from("purchase_orders")
    .select("*, purchase_items(*, products(name))")
    .eq("user_id", user.id);

  const sales = allSales ?? [];
  const products = allProducts ?? [];
  const expenses = allExpenses ?? [];
  const purchases = allPurchases ?? [];

  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  const chartDataList: { label: string; revenue: number; profit: number; cost: number }[] = [];

  if (period === 'daily') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const periodSales = sales.filter(s => { const sd = new Date(s.date); return sd >= startDate && sd <= endDate; });

    for (let h = 0; h < 24; h++) {
      const hStart = new Date(startDate);
      hStart.setHours(h, 0, 0, 0);
      const hEnd = new Date(startDate);
      hEnd.setHours(h, 59, 59, 999);
      const hourSales = periodSales.filter(s => { const sd = new Date(s.date); return sd >= hStart && sd <= hEnd; });
      let revenue = 0, cost = 0;
      for (const sale of hourSales) {
        revenue += Number(sale.total_amount) || 0;
        for (const item of sale.sale_items ?? []) {
          cost += Number(item.cost_price) * Number(item.quantity);
        }
      }
      chartDataList.push({ label: `${h.toString().padStart(2, '0')}h`, revenue, profit: revenue - cost, cost });
    }
  } else if (period === 'weekly') {
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    const periodSales = sales.filter(s => { const sd = new Date(s.date); return sd >= startDate && sd <= endDate; });

    const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    for (let i = 0; i < 7; i++) {
      const dStart = new Date(startDate);
      dStart.setDate(dStart.getDate() + i);
      const dEnd = new Date(dStart);
      dEnd.setHours(23, 59, 59, 999);
      const daySales = periodSales.filter(s => { const sd = new Date(s.date); return sd >= dStart && sd <= dEnd; });
      let revenue = 0, cost = 0;
      for (const sale of daySales) {
        revenue += Number(sale.total_amount) || 0;
        for (const item of sale.sale_items ?? []) {
          cost += Number(item.cost_price) * Number(item.quantity);
        }
      }
      chartDataList.push({ label: dayNames[i], revenue, profit: revenue - cost, cost });
    }
  } else if (period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const periodSales = sales.filter(s => { const sd = new Date(s.date); return sd >= startDate && sd <= endDate; });

    const daysInMonth = endDate.getDate();
    const weeksCount = Math.ceil(daysInMonth / 7);
    for (let w = 0; w < weeksCount; w++) {
      const wStart = new Date(startDate);
      wStart.setDate(wStart.getDate() + w * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(Math.min(wStart.getDate() + 6, daysInMonth));
      wEnd.setHours(23, 59, 59, 999);
      const weekSales = periodSales.filter(s => { const sd = new Date(s.date); return sd >= wStart && sd <= wEnd; });
      let revenue = 0, cost = 0;
      for (const sale of weekSales) {
        revenue += Number(sale.total_amount) || 0;
        for (const item of sale.sale_items ?? []) {
          cost += Number(item.cost_price) * Number(item.quantity);
        }
      }
      chartDataList.push({ label: `S${w + 1}`, revenue, profit: revenue - cost, cost });
    }
  } else {
    if (!customStart || !customEnd) return null;
    startDate = new Date(customStart);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(customEnd);
    endDate.setHours(23, 59, 59, 999);
    const periodSales = sales.filter(s => { const sd = new Date(s.date); return sd >= startDate && sd <= endDate; });

    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays <= 1) {
      for (let h = 0; h < 24; h++) {
        const hStart = new Date(startDate);
        hStart.setHours(h, 0, 0, 0);
        const hEnd = new Date(startDate);
        hEnd.setHours(h, 59, 59, 999);
        const hourSales = periodSales.filter(s => { const sd = new Date(s.date); return sd >= hStart && sd <= hEnd; });
        let revenue = 0, cost = 0;
        for (const sale of hourSales) {
          revenue += Number(sale.total_amount) || 0;
          for (const item of sale.sale_items ?? []) {
            cost += Number(item.cost_price) * Number(item.quantity);
          }
        }
        chartDataList.push({ label: `${h.toString().padStart(2, '0')}h`, revenue, profit: revenue - cost, cost });
      }
    } else if (diffDays <= 31) {
      const current = new Date(startDate);
      while (current <= endDate) {
        const dStart = new Date(current);
        const dEnd = new Date(current);
        dEnd.setHours(23, 59, 59, 999);
        const daySales = periodSales.filter(s => { const sd = new Date(s.date); return sd >= dStart && sd <= dEnd; });
        let revenue = 0, cost = 0;
        for (const sale of daySales) {
          revenue += Number(sale.total_amount) || 0;
          for (const item of sale.sale_items ?? []) {
            cost += Number(item.cost_price) * Number(item.quantity);
          }
        }
        const label = current.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        chartDataList.push({ label, revenue, profit: revenue - cost, cost });
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
        const weekSales = periodSales.filter(s => { const sd = new Date(s.date); return sd >= wStart && sd <= wEnd; });
        let revenue = 0, cost = 0;
        for (const sale of weekSales) {
          revenue += Number(sale.total_amount) || 0;
          for (const item of sale.sale_items ?? []) {
            cost += Number(item.cost_price) * Number(item.quantity);
          }
        }
        const label = `${wStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${wEnd.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`;
        chartDataList.push({ label, revenue, profit: revenue - cost, cost });
        current.setDate(current.getDate() + 7);
      }
    }
  }

  const periodSales = sales.filter(s => { const sd = new Date(s.date); return sd >= startDate && sd <= endDate; });
  const periodExpenses = expenses.filter(e => { const ed = new Date(e.date); return ed >= startDate && ed <= endDate; });
  const periodPurchases = purchases.filter(p => { const pd = new Date(p.date); return pd >= startDate && pd <= endDate; });

  let totalRevenue = 0, totalCost = 0, totalArticles = 0;
  const productSales: Record<string, { name: string; quantity: number; revenue: number; profit: number }> = {};

  for (const sale of periodSales) {
    totalRevenue += Number(sale.total_amount) || 0;
    for (const item of sale.sale_items ?? []) {
      const itemCost = Number(item.cost_price) * Number(item.quantity);
      const itemRevenue = Number(item.unit_price) * Number(item.quantity);
      totalCost += itemCost;
      totalArticles += Number(item.quantity);
      const pid = item.product_id;
      if (!productSales[pid]) {
        productSales[pid] = { name: item.products?.name || "Inconnu", quantity: 0, revenue: 0, profit: 0 };
      }
      productSales[pid].quantity += Number(item.quantity);
      productSales[pid].revenue += itemRevenue;
      productSales[pid].profit += itemRevenue - itemCost;
    }
  }
  const totalProfit = totalRevenue - totalCost;

  let totalExpenses = 0;
  for (const exp of periodExpenses) {
    totalExpenses += Number(exp.amount) || 0;
  }

  let totalPurchases = 0;
  for (const pur of periodPurchases) {
    totalPurchases += Number(pur.total_amount) || 0;
  }

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const lowStock = products.filter(p => Number(p.current_stock) <= Number(p.min_stock));

  const avgOrderValue = periodSales.length > 0 ? totalRevenue / periodSales.length : 0;
  const netMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return {
    chartData: chartDataList,
    totalRevenue,
    totalProfit,
    totalCost,
    totalExpenses,
    totalPurchases,
    topProducts,
    lowStock,
    avgOrderValue,
    netMargin,
    totalSales: totalArticles,
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
    .select("*, sale_items(*, products(name))")
    .eq("user_id", user.id)
    .gte("date", todayStart.toISOString())
    .lte("date", todayEnd.toISOString());

  const { data: purchases } = await supabase
    .from("purchase_orders")
    .select("*, purchase_items(*, products(name)), suppliers(name)")
    .eq("user_id", user.id)
    .gte("date", todayStart.toISOString())
    .lte("date", todayEnd.toISOString());

  const { data: products } = await supabase
    .from("products")
    .select("id, name, current_stock, min_stock, unit, selling_price, production_cost")
    .eq("user_id", user.id);

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", todayStart.toISOString())
    .lte("date", todayEnd.toISOString());

  const salesList = sales ?? [];
  const purchasesList = purchases ?? [];
  const productsList = products ?? [];
  const expensesList = expenses ?? [];

  let totalRevenue = 0;
  let totalConsumption = 0;
  let totalProfit = 0;
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number; profit: number; consumption: number }> = {};

  for (const sale of salesList) {
    totalRevenue += Number(sale.total_amount) || 0;
    for (const item of sale.sale_items ?? []) {
      const itemRevenue = Number(item.unit_price) * Number(item.quantity);
      const itemCost = Number(item.cost_price) * Number(item.quantity);
      totalConsumption += itemCost;
      totalProfit += itemRevenue - itemCost;
      const pid = item.product_id;
      if (!productSalesMap[pid]) {
        productSalesMap[pid] = { name: item.products?.name || "Inconnu", quantity: 0, revenue: 0, profit: 0, consumption: 0 };
      }
      productSalesMap[pid].quantity += Number(item.quantity);
      productSalesMap[pid].revenue += itemRevenue;
      productSalesMap[pid].profit += itemRevenue - itemCost;
      productSalesMap[pid].consumption += itemCost;
    }
  }

  return {
    date: todayStart.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
    purchases: purchasesList.map(p => ({
      supplier: p.suppliers?.name || '-',
      items: p.purchase_items?.map((pi: any) => `${pi.products?.name || '?'} (${pi.quantity})`).join(', ') || '-',
      total: Number(p.total_amount),
    })),
    totalPurchases: purchasesList.reduce((acc, p) => acc + Number(p.total_amount), 0),
    expenses: expensesList.map(e => ({
      description: e.description,
      amount: Number(e.amount),
      date: new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    })),
    totalExpenses: expensesList.reduce((acc, e) => acc + Number(e.amount), 0),
    products: Object.values(productSalesMap),
    stock: productsList.map(p => ({
      name: p.name,
      stock: Number(p.current_stock),
      unit: p.unit,
    })),
    totalRevenue,
    totalConsumption,
    totalProfit,
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
    .select("*, sale_items(*, products(name))")
    .eq("user_id", user.id)
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString())
    .order("date", { ascending: true });

  const { data: purchases } = await supabase
    .from("purchase_orders")
    .select("*, purchase_items(*, products(name)), suppliers(name)")
    .eq("user_id", user.id)
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString())
    .order("date", { ascending: true });

  const { data: products } = await supabase
    .from("products")
    .select("id, name, current_stock, min_stock, unit, selling_price, production_cost")
    .eq("user_id", user.id);

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString())
    .order("date", { ascending: true });

  const salesList = sales ?? [];
  const purchasesList = purchases ?? [];
  const productsList = products ?? [];
  const expensesList = expenses ?? [];

  const days: { date: string; label: string; revenue: number; consumption: number; profit: number; purchases: number; products: { name: string; quantity: number; revenue: number; consumption: number; profit: number }[] }[] = [];

  const current = new Date(startDate);
  while (current <= endDate) {
    const dayStr = current.toISOString().split('T')[0];
    const label = current.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
    const dayStart = new Date(current);
    const dayEnd = new Date(current);
    dayEnd.setHours(23, 59, 59, 999);

    const daySales = salesList.filter(s => { const sd = new Date(s.date); return sd >= dayStart && sd <= dayEnd; });
    const dayPurchases = purchasesList.filter(p => { const pd = new Date(p.date); return pd >= dayStart && pd <= dayEnd; });

    let revenue = 0, consumption = 0, profit = 0;
    const productMap: Record<string, { name: string; quantity: number; revenue: number; consumption: number; profit: number }> = {};

    for (const sale of daySales) {
      revenue += Number(sale.total_amount) || 0;
      for (const item of sale.sale_items ?? []) {
        const itemRevenue = Number(item.unit_price) * Number(item.quantity);
        const itemCost = Number(item.cost_price) * Number(item.quantity);
        consumption += itemCost;
        profit += itemRevenue - itemCost;
        const pid = item.product_id;
        if (!productMap[pid]) {
          productMap[pid] = { name: item.products?.name || "Inconnu", quantity: 0, revenue: 0, consumption: 0, profit: 0 };
        }
        productMap[pid].quantity += Number(item.quantity);
        productMap[pid].revenue += itemRevenue;
        productMap[pid].consumption += itemCost;
        productMap[pid].profit += itemRevenue - itemCost;
      }
    }

    const dayPurchaseTotal = dayPurchases.reduce((acc, p) => acc + Number(p.total_amount), 0);

    days.push({
      date: dayStr,
      label,
      revenue,
      consumption,
      profit,
      purchases: dayPurchaseTotal,
      products: Object.values(productMap),
    });

    current.setDate(current.getDate() + 1);
  }

  let totalRevenue = 0, totalConsumption = 0, totalProfit = 0, totalPurchases = 0;
  const allProductsMap: Record<string, { name: string; quantity: number; revenue: number; consumption: number; profit: number }> = {};

  for (const sale of salesList) {
    totalRevenue += Number(sale.total_amount) || 0;
    for (const item of sale.sale_items ?? []) {
      const itemRevenue = Number(item.unit_price) * Number(item.quantity);
      const itemCost = Number(item.cost_price) * Number(item.quantity);
      totalConsumption += itemCost;
      totalProfit += itemRevenue - itemCost;
      const pid = item.product_id;
      if (!allProductsMap[pid]) {
        allProductsMap[pid] = { name: item.products?.name || "Inconnu", quantity: 0, revenue: 0, consumption: 0, profit: 0 };
      }
      allProductsMap[pid].quantity += Number(item.quantity);
      allProductsMap[pid].revenue += itemRevenue;
      allProductsMap[pid].consumption += itemCost;
      allProductsMap[pid].profit += itemRevenue - itemCost;
    }
  }

  for (const p of purchasesList) {
    totalPurchases += Number(p.total_amount) || 0;
  }

  return {
    days,
    totalRevenue,
    totalConsumption,
    totalProfit,
    totalPurchases,
    expenses: expensesList.map(e => ({
      description: e.description,
      amount: Number(e.amount),
      date: new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    })),
    totalExpenses: expensesList.reduce((acc, e) => acc + Number(e.amount), 0),
    products: Object.values(allProductsMap),
    stock: productsList.map(p => ({ name: p.name, stock: Number(p.current_stock), unit: p.unit })),
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

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const sevenDaysStart = new Date(todayStart);
  sevenDaysStart.setDate(sevenDaysStart.getDate() - 7);

  const sales = allSales ?? [];
  const todaySales = sales.filter(s => new Date(s.date) >= todayStart);
  const yesterdaySales = sales.filter(s => new Date(s.date) >= yesterdayStart && new Date(s.date) < todayStart);
  const weekSales = sales.filter(s => new Date(s.date) >= sevenDaysStart);

  const lowStock = (allProducts ?? [])
    .filter(p => Number(p.current_stock) <= Number(p.min_stock))
    .sort((a, b) => Number(a.current_stock) - Number(b.current_stock));

  let todayRevenue = 0;
  let todayProfit = 0;
  let todayArticles = 0;
  for (const sale of todaySales) {
    todayRevenue += Number(sale.total_amount) || 0;
    for (const item of sale.sale_items ?? []) {
      const itemRevenue = Number(item.unit_price) * Number(item.quantity);
      const itemCost = Number(item.cost_price) * Number(item.quantity);
      todayProfit += itemRevenue - itemCost;
      todayArticles += Number(item.quantity);
    }
  }

  let yesterdayRevenue = 0;
  let yesterdayProfit = 0;
  let yesterdayArticles = 0;
  for (const sale of yesterdaySales) {
    yesterdayRevenue += Number(sale.total_amount) || 0;
    for (const item of sale.sale_items ?? []) {
      const itemRevenue = Number(item.unit_price) * Number(item.quantity);
      const itemCost = Number(item.cost_price) * Number(item.quantity);
      yesterdayProfit += itemRevenue - itemCost;
      yesterdayArticles += Number(item.quantity);
    }
  }

  const revenueChange = yesterdayRevenue > 0 ? (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(0) : "0";
  const profitChange = yesterdayProfit > 0 ? (((todayProfit - yesterdayProfit) / yesterdayProfit) * 100).toFixed(0) : "0";
  const salesChange = yesterdayArticles > 0 ? (((todayArticles - yesterdayArticles) / yesterdayArticles) * 100).toFixed(0) : "0";

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
    let dayProfit = 0;
    for (const sale of daySales) {
      dayRevenue += Number(sale.total_amount) || 0;
      for (const item of sale.sale_items ?? []) {
        const itemRevenue = Number(item.unit_price) * Number(item.quantity);
        const itemCost = Number(item.cost_price) * Number(item.quantity);
        dayProfit += itemRevenue - itemCost;
      }
    }
    weeklyData.push({ day: dayNames[d.getDay()], revenue: dayRevenue, profit: dayProfit });
  }

  const productSales: Record<string, { name: string; quantity: number }> = {};
  for (const sale of weekSales) {
    for (const item of sale.sale_items ?? []) {
      const pid = item.product_id;
      if (!productSales[pid]) {
        productSales[pid] = { name: item.products?.name || "Inconnu", quantity: 0 };
      }
      productSales[pid].quantity += Number(item.quantity);
    }
  }

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const recentSales = todaySales
    .slice(0, 5)
    .map(sale => {
      const items = sale.sale_items ?? [];
      const productNames = items.map((item: any) => `${item.products?.name || "?"} (${item.quantity})`).join(", ");
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
        products: productNames || "-",
        total: Number(sale.total_amount),
        time: timeLabel,
      };
    });

  return {
    todayRevenue,
    todayProfit,
    todayCount: todayArticles,
    revenueChange: Number(revenueChange),
    profitChange: Number(profitChange),
    salesChange: Number(salesChange),
    lowStock,
    weeklyData,
    topProducts,
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

export async function deleteSale(saleId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: sale } = await supabase.from("sales").select("*").eq("id", saleId).eq("user_id", user.id).single();
  if (!sale) throw new Error("Vente non trouvee");

  const { data: saleItems } = await supabase.from("sale_items").select("*").eq("sale_id", saleId);
  if (saleItems) {
    for (const item of saleItems) {
      const { data: product } = await supabase.from("products").select("current_stock").eq("id", item.product_id).single();
      const newStock = product ? Number(product.current_stock) + Number(item.quantity) : 0;
      await supabase.from("products").update({ current_stock: newStock }).eq("id", item.product_id);
    }
  }

  const { error } = await supabase.from("sales").delete().eq("id", saleId);
  if (error) throw error;

  revalidatePath("/sales");
  revalidatePath("/dashboard");
}

export async function updateSale(saleId: string, saleItems: { productId: string; quantity: number; unitPrice: number; costPrice: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existingSale } = await supabase.from("sales").select("*").eq("id", saleId).eq("user_id", user.id).single();
  if (!existingSale) throw new Error("Vente non trouvee");

  const { data: existingItems } = await supabase.from("sale_items").select("*").eq("sale_id", saleId);
  if (existingItems) {
    for (const item of existingItems) {
      const { data: product } = await supabase.from("products").select("current_stock").eq("id", item.product_id).single();
      const newStock = product ? Number(product.current_stock) + Number(item.quantity) : 0;
      await supabase.from("products").update({ current_stock: newStock }).eq("id", item.product_id);
    }
  }

  await supabase.from("sale_items").delete().eq("sale_id", saleId);

  const total = saleItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  await supabase.from("sales").update({ total_amount: total }).eq("id", saleId);

  const itemsToInsert = saleItems.map(item => ({
    sale_id: saleId,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    cost_price: item.costPrice,
  }));

  const { error: itemsError } = await supabase.from("sale_items").insert(itemsToInsert);
  if (itemsError) throw itemsError;

  for (const item of saleItems) {
    const { data: product } = await supabase.from("products").select("current_stock").eq("id", item.productId).single();
    const newStock = product ? Math.max(Number(product.current_stock) - item.quantity, 0) : 0;
    await supabase.from("products").update({ current_stock: newStock }).eq("id", item.productId);
  }

  revalidatePath("/sales");
  revalidatePath("/dashboard");
}

export async function createSale(saleDate: string, saleItems: { productId: string; quantity: number; unitPrice: number; costPrice: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const total = saleItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const { data: saleData, error: saleError } = await supabase.from("sales").insert({
    total_amount: total,
    date: new Date(saleDate).toISOString(),
    user_id: user.id,
  }).select().single();

  if (saleError || !saleData) throw saleError;

  const itemsToInsert = saleItems.map(item => ({
    sale_id: saleData.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    cost_price: item.costPrice,
  }));

  const { error: itemsError } = await supabase.from("sale_items").insert(itemsToInsert);

  if (itemsError) throw itemsError;

  for (const item of saleItems) {
    const { data: product } = await supabase.from("products").select("current_stock").eq("id", item.productId).single();
    const newStock = product ? Math.max(Number(product.current_stock) - item.quantity, 0) : 0;
    await supabase.from("products").update({ current_stock: newStock }).eq("id", item.productId);
  }

  revalidatePath("/sales");
  revalidatePath("/dashboard");
}
