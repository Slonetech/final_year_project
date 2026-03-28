import { createClient } from '../server'
import { PurchaseOrder, CreatePurchaseOrderDto } from '@/lib/types'
import { mapToSnakeCase, mapToCamelCase, mapArrayToCamelCase } from '../../utils/mapping'

export async function getAll(query: string = "", status: string = "all") {
  const supabase = await createClient()
  let q = supabase
    .from('purchases')
    .select('*, suppliers(name)')
    .order('purchase_date', { ascending: false })
  
  if (query) {
    q = q.or(`notes.ilike.%${query}%,suppliers.name.ilike.%${query}%`)
  }

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
    .from('purchases')
    .select('*, suppliers(name), purchase_items(*, inventory(name))')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return mapToCamelCase(data) as any
}

export async function create(purchase: CreatePurchaseOrderDto, items: any[]) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('purchases')
    .insert(mapToSnakeCase(purchase))
    .select()
    .single()
  
  if (error) throw error

  const purchaseItems = items.map(item => ({
    ...mapToSnakeCase(item),
    purchase_id: data.id
  }))

  const { error: itemsError } = await supabase
    .from('purchase_items')
    .insert(purchaseItems)
  
  if (itemsError) throw itemsError
  
  return mapToCamelCase(data)
}

export async function update(id: string, purchase: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchases')
    .update(mapToSnakeCase(purchase))
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return mapToCamelCase(data)
}

export async function remove(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}
