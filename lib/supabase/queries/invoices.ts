import { createClient } from '../server'
import { Invoice, CreateInvoiceDto } from '@/lib/types'
import { mapToSnakeCase, mapToCamelCase, mapArrayToCamelCase } from '../../utils/mapping'

export async function getAll(status: string = "all") {
  const supabase = await createClient()

  // Fetch invoices with customer info and related payments
  let q = supabase
    .from('invoices')
    .select(`
      *,
      customers(name, email, address),
      payments(amount)
    `)
    .order('issue_date', { ascending: false })

  if (status !== 'all') {
    q = q.eq('status', status)
  }

  const { data, error } = await q

  if (error) throw error

  // Map data and flatten customer name + calculate payment amounts
  return data.map(item => {
    const totalAmount = Number(item.total_amount) || 0;
    // Calculate amount paid from related payments
    const amountPaid = item.payments?.reduce((sum: number, payment: any) =>
      sum + (Number(payment.amount) || 0), 0) || 0;
    const amountDue = totalAmount - amountPaid;

    return {
      ...mapToCamelCase(item),
      customerName: item.customers?.name || '',
      customerEmail: item.customers?.email || '',
      customerAddress: item.customers?.address || '',
      // Match what the client expects
      total: totalAmount,
      totalAmount, // Keep both for compatibility
      amountPaid,
      amountDue: Math.max(0, amountDue), // Don't show negative
      // Ensure date fields match client expectations
      invoiceDate: item.issue_date,
      invoiceNumber: item.invoice_number,
    };
  }) as any[]
}

export async function getById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, customers(name), sales(*, sale_items(*, inventory(name)))')
    .eq('id', id)
    .single()

  if (error) throw error

  // Map and flatten nested data
  const mapped = mapToCamelCase(data)
  return {
    ...mapped,
    customerName: data.customers?.name || '',
    totalAmount: Number(data.total_amount) || 0,
    amountPaid: Number(data.amount_paid) || 0,
    amountDue: Number(data.amount_due) || 0,
  } as any
}

export async function create(invoice: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      ...mapToSnakeCase(invoice),
      user_id: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return mapToCamelCase(data)
}

export async function update(id: string, invoice: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .update(mapToSnakeCase(invoice))
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return mapToCamelCase(data)
}

export async function remove(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}
