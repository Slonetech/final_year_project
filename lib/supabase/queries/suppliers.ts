import { createClient } from '../server'
import { Supplier, CreateSupplierDto, UpdateSupplierDto } from '@/lib/types'
import { mapToSnakeCase, mapToCamelCase, mapArrayToCamelCase } from '../../utils/mapping'

export async function getAll(query: string = "", status: string = "all") {
  const supabase = await createClient()
  let q = supabase
    .from('suppliers')
    .select('*')
    .order('name')
  
  if (query) {
    q = q.or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
  }

  if (status !== 'all') {
    q = q.eq('status', status)
  }

  const { data, error } = await q
  
  if (error) throw error
  return mapArrayToCamelCase(data) as Supplier[]
}

export async function getById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return mapToCamelCase(data) as Supplier
}

export async function create(supplier: CreateSupplierDto) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      ...mapToSnakeCase(supplier),
      user_id: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return mapToCamelCase(data) as Supplier
}

export async function update(id: string, supplier: UpdateSupplierDto) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .update(mapToSnakeCase(supplier))
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return mapToCamelCase(data) as Supplier
}

export async function remove(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}
