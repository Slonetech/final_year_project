import { createClient } from '../server'
import { mapToCamelCase, mapArrayToCamelCase } from '../utils/mapping'

export async function getDashboardKPIs() {
  const supabase = await createClient()

  // Fetch real data from Supabase
  const { data: invoices } = await supabase.from('invoices').select('total_amount')
  const { data: payments } = await supabase.from('payments').select('amount')
  const { data: purchases } = await supabase.from('purchases').select('total')

  const totalRevenue = invoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0
  const totalExpenses = purchases?.reduce((sum, pur) => sum + Number(pur.total), 0) || 0
  const cashBalance = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  return {
    totalRevenue,
    revenueChange: +12.5, // Mock change for now
    totalExpenses,
    expensesChange: -5.2,
    netProfit: totalRevenue - totalExpenses,
    profitChange: +8.1,
    cashBalance,
    cashChange: +2.4
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
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, balance')
    .order('balance', { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching top customers:", error)
    return []
  }

  return (data || []).map(c => ({
    id: c.id,
    name: c.name,
    revenue: c.balance || 0,
    invoiceCount: 0
  }))
}

export async function getSalesExpensesTrend() {
  const supabase = await createClient()

  // Start from October 2025
  const startDate = new Date(2025, 9, 1) // October is month 9 (0-indexed)

  // Fetch invoices and purchases from October 2025 onwards
  const { data: allInvoices } = await supabase
    .from('invoices')
    .select('total_amount, invoice_date')
    .gte('invoice_date', startDate.toISOString().split('T')[0])
    .order('invoice_date')

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
    const date = new Date(inv.invoice_date)
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
