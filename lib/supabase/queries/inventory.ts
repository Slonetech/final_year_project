import { createClient } from '../server'
import { Product, CreateProductDto, UpdateProductDto } from '@/lib/types'
import { mapToSnakeCase, mapToCamelCase, mapArrayToCamelCase } from '../../utils/mapping'

export async function getAll(query: string = "", category: string = "all") {
  const supabase = await createClient()
  let q = supabase
    .from('inventory')
    .select('*, suppliers(name)')
    .order('name')
  
  if (query) {
    q = q.or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
  }

  if (category !== 'all') {
    q = q.eq('category', category)
  }

  const { data, error } = await q
  
  if (error) throw error
  return mapArrayToCamelCase(data) as any[]
}

export async function getById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory')
    .select('*, suppliers(name)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return mapToCamelCase(data) as any
}

export async function create(product: CreateProductDto) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory')
    .insert(mapToSnakeCase(product))
    .select()
    .single()
  
  if (error) throw error
  return mapToCamelCase(data) as Product
}

export async function update(id: string, product: UpdateProductDto) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory')
    .update(mapToSnakeCase(product))
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return mapToCamelCase(data) as Product
}

export async function remove(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}
