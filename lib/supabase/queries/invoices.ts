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

  // 1. Generate sequential invoice number (INV-1001 base)
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })

  const nextNumber = (count || 0) + 1001
  const invoiceNumber = `INV-${nextNumber}`

  // 2. Destructure data from the frontend
  const {
    customerId,      // -> customer_id
    invoiceDate,     // -> issue_date
    dueDate,         // -> due_date
    status,          // -> status
    total,           // -> total_amount
    vatAmount,       // -> tax_amount
    userId,          // fallback for user_id
    // FIELDS TO EXCLUDE (These do not exist in the 'invoices' table schema)
    customerName,
    customerEmail,
    customerAddress,
    lines,
    subtotal,
    vatRate,
    withholdingTax,
    withholdingTaxRate,
    notes,
    termsAndConditions,
    ...rest
  } = invoice

  // 3. Perform the sanitized Insert
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      customer_id: customerId,
      issue_date: invoiceDate ? new Date(invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      due_date: dueDate ? new Date(dueDate).toISOString().split('T')[0] : null,
      status: status || 'unpaid',
      total_amount: Number(total) || 0,
      tax_amount: Number(vatAmount) || 0,
      amount_paid: 0,
      amount_due: Number(total) || 0,
      user_id: user?.id || userId
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
