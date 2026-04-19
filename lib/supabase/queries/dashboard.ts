import { createClient } from '../server'

export async function getDashboardKPIs() {
  const supabase = await createClient()

  // Fetch real data from Supabase including dates for trend analysis
  const { data: invoices } = await supabase.from('invoices').select('total_amount, issue_date')
  const { data: payments } = await supabase.from('payments').select('amount, type, payment_date')
  const { data: purchases } = await supabase.from('purchases').select('total, order_date')

  // Setup date boundaries
  const now = new Date()
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  // Helper for percentage change calculation
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  // Derive current and previous period totals for trends
  const currRevenue = invoices?.filter(inv => new Date(inv.issue_date) >= startOfCurrentMonth)
    .reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0
  const prevRevenue = invoices?.filter(inv => {
    const d = new Date(inv.issue_date);
    return d >= startOfPrevMonth && d <= endOfPrevMonth;
  }).reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0

  const currExpenses = purchases?.filter(pur => new Date(pur.order_date) >= startOfCurrentMonth)
    .reduce((sum, pur) => sum + Number(pur.total), 0) || 0
  const prevExpenses = purchases?.filter(pur => {
    const d = new Date(pur.order_date);
    return d >= startOfPrevMonth && d <= endOfPrevMonth;
  }).reduce((sum, pur) => sum + Number(pur.total), 0) || 0

  const currCashChange = payments?.filter(p => new Date(p.payment_date) >= startOfCurrentMonth)
    .reduce((sum, p) => p.type === 'received' ? sum + Number(p.amount) : sum - Number(p.amount), 0) || 0
  const prevCashChange = payments?.filter(p => {
    const d = new Date(p.payment_date);
    return d >= startOfPrevMonth && d <= endOfPrevMonth;
  }).reduce((sum, p) => p.type === 'received' ? sum + Number(p.amount) : sum - Number(p.amount), 0) || 0

  const totalRevenue = invoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0
  const totalExpenses = purchases?.reduce((sum, pur) => sum + Number(pur.total), 0) || 0
  const cashBalance = payments?.reduce((sum, p) => {
    return p.type === 'received'
      ? sum + Number(p.amount)
      : sum - Number(p.amount)
  }, 0) || 0

  return {
    totalRevenue,
    revenueChange: calculateChange(currRevenue, prevRevenue),
    totalExpenses,
    expensesChange: calculateChange(currExpenses, prevExpenses),
    netProfit: totalRevenue - totalExpenses,
    profitChange: calculateChange(currRevenue - currExpenses, prevRevenue - prevExpenses),
    cashBalance,
    cashChange: calculateChange(currCashChange, prevCashChange)
  }
}

export async function getRecentTransactions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('id, amount, payment_date, reference, customers(name)')
    .order('payment_date', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error("Error fetching recent transactions:", error)
    return []
  }
  
  return (data || []).map((p: any) => ({
    id: p.id,
    description: `Payment from ${p.customers?.name || 'Customer'}`,
    amount: p.amount,
    date: p.payment_date,
    reference: p.reference,
    status: 'paid'
  }))
}

export async function getLowStockAlerts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory')
    .select('id, name, stock_level, reorder_point')

  if (error) {
    console.error("Error fetching low stock alerts:", error)
    return []
  }

  // Filter in JS to avoid PostgREST column-to-column comparison limitation
  const lowStock = (data || []).filter(item => item.stock_level < item.reorder_point)

  return lowStock.map(item => ({
    productId: item.id,
    productName: item.name,
    currentStock: item.stock_level,
    reorderPoint: item.reorder_point
  }))
}

export async function getTopCustomers() {
  const supabase = await createClient()

  // Aggregate total invoice revenue per customer (not balance/debt)
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('customer_id, total_amount, customers(name)')

  if (error) {
    console.error("Error fetching top customers:", error)
    return []
  }

  // Group and aggregate in JS (Supabase query builder doesn't support GROUP BY)
  const revenueMap = new Map<string, { id: string; name: string; revenue: number; invoiceCount: number }>()

  ;(invoices || []).forEach((inv: any) => {
    const customerId = inv.customer_id
    const customerName = inv.customers?.name || 'Unknown'
    const amount = Number(inv.total_amount) || 0

    if (!revenueMap.has(customerId)) {
      revenueMap.set(customerId, { id: customerId, name: customerName, revenue: 0, invoiceCount: 0 })
    }
    const entry = revenueMap.get(customerId)!
    entry.revenue += amount
    entry.invoiceCount += 1
  })

  // Sort by revenue descending, return top 5
  return Array.from(revenueMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
}

export async function getSalesExpensesTrend() {
  const supabase = await createClient()

  // Start from October 2025
  const startDate = new Date(2025, 9, 1) // October is month 9 (0-indexed)

  // Fetch invoices and purchases from October 2025 onwards
  const { data: allInvoices } = await supabase
    .from('invoices')
    .select('total_amount, issue_date')
    .gte('issue_date', startDate.toISOString().split('T')[0])
    .order('issue_date')

  const { data: allPurchases } = await supabase
    .from('purchases')
    .select('total, order_date')
    .gte('order_date', startDate.toISOString().split('T')[0])
    .order('order_date')

  // Calculate months from October 2025 to now
  const monthlyData = new Map<string, { sales: number; expenses: number; sortDate: Date }>()
  const currentDate = new Date()

  // Generate months from October 2025 to current month
  const tempDate = new Date(startDate)
  while (tempDate <= currentDate) {
    const monthKey = tempDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    monthlyData.set(monthKey, { sales: 0, expenses: 0, sortDate: new Date(tempDate) })
    tempDate.setMonth(tempDate.getMonth() + 1)
  }

  // Aggregate invoices (sales) by month
  allInvoices?.forEach((inv: any) => {
    const date = new Date(inv.issue_date)
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    if (monthlyData.has(monthKey)) {
      const current = monthlyData.get(monthKey)!
      current.sales += Number(inv.total_amount) || 0
    }
  })

  // Aggregate purchases (expenses) by month
  allPurchases?.forEach((pur: any) => {
    const date = new Date(pur.order_date)
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    if (monthlyData.has(monthKey)) {
      const current = monthlyData.get(monthKey)!
      current.expenses += Number(pur.total) || 0
    }
  })

  // Convert to array format for chart, sorted by date
  return Array.from(monthlyData.entries())
    .sort((a, b) => a[1].sortDate.getTime() - b[1].sortDate.getTime())
    .map(([month, data]) => ({
      month,
      sales: data.sales,
      expenses: data.expenses,
    }))
}
