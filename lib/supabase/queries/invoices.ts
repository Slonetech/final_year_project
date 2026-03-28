import { createClient } from '../server'
import { Invoice, CreateInvoiceDto } from '@/lib/types'
import { mapToSnakeCase, mapToCamelCase, mapArrayToCamelCase } from '../../utils/mapping'

export async function getAll(status: string = "all") {
  const supabase = await createClient()
  let q = supabase
    .from('invoices')
    .select('*, customers(name)')
    .order('issue_date', { ascending: false })
  
  if (status !== 'all') {
    q = q.eq('status', status)
  }

  const { data, error } = await q
  
  if (error) throw error
  return mapArrayToCamelCase(data) as any[]
}

export async function getById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, customers(name), sales(*, sale_items(*, inventory(name)))')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return mapToCamelCase(data) as any
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
