import { createClient } from '../server'
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/lib/types'
import { mapToSnakeCase, mapToCamelCase, mapArrayToCamelCase } from '../../utils/mapping'

export async function getAll(query: string = "", status: string = "all") {
  const supabase = await createClient()
  let q = supabase
    .from('customers')
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
  return mapArrayToCamelCase(data) as Customer[]
}

export async function getById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return mapToCamelCase(data) as Customer
}

export async function create(customer: CreateCustomerDto) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...mapToSnakeCase(customer),
      user_id: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return mapToCamelCase(data) as Customer
}

export async function update(id: string, customer: UpdateCustomerDto) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .update(mapToSnakeCase(customer))
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return mapToCamelCase(data) as Customer
}

export async function remove(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}
