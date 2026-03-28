import { createClient } from '../server'
import { mapToCamelCase, mapArrayToCamelCase } from '../utils/mapping'

export async function getDashboardKPIs() {
  const supabase = await createClient()
  
  // Fetch real data from Supabase
  const { data: invoices } = await supabase.from('invoices').select('total_amount')
  const { data: payments } = await supabase.from('payments').select('amount')
  const { data: purchases } = await supabase.from('purchases').select('total_amount')
  
  const totalRevenue = invoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0
  const totalExpenses = purchases?.reduce((sum, pur) => sum + Number(pur.total_amount), 0) || 0
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
    .select('id, name, quantity, reorder_level')
  
  if (error) {
    console.error("Error fetching low stock alerts:", error)
    return []
  }
  
  // Filter in JS to avoid PostgREST column-to-column comparison limitation
  const lowStock = (data || []).filter(item => item.quantity < item.reorder_level)
  
  return lowStock.map(item => ({
    productId: item.id,
    productName: item.name,
    currentStock: item.quantity,
    reorderPoint: item.reorder_level
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
