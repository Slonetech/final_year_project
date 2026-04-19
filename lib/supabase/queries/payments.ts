import { createClient } from '../server'
import { Payment, CreatePaymentDto } from '@/lib/types'
import { mapToSnakeCase, mapToCamelCase, mapArrayToCamelCase } from '../../utils/mapping'

export async function getAll(type: string = "all") {
  const supabase = await createClient()

  // Join with customers, suppliers, and invoices (to get customer from invoice if direct FK is null)
  let q = supabase
    .from('payments')
    .select(`
      *,
      customers(name),
      suppliers(name),
      invoices(
        customer_id,
        customers(name)
      )
    `)
    .order('payment_date', { ascending: false })

  if (type !== 'all') {
    q = q.eq('type', type)
  }

  const { data, error } = await q

  if (error) {
    console.error('Error fetching payments:', error)
    throw error
  }

  // Map data with proper field names for the client
  return (data || []).map(item => ({
    ...mapToCamelCase(item),
    // Map field names to match Payment type
    paymentNumber: item.payment_number || item.reference || '—',
    date: item.payment_date,
    method: item.method || 'cash',
    type: item.type || 'made',
    customerName: item.customers?.name || item.invoices?.customers?.name || '',
    supplierName: item.suppliers?.name || '',
    amount: Number(item.amount) || 0,
  })) as any[]
}

export async function getById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*, customers(name), invoices(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return mapToCamelCase(data) as any
}

export async function create(payment: CreatePaymentDto) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('payments')
    .insert({
      ...mapToSnakeCase(payment),
      user_id: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return mapToCamelCase(data)
}

export async function remove(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}
