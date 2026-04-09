import { createClient } from '../server'
import { PurchaseOrder, CreatePurchaseOrderDto } from '@/lib/types'
import { mapToSnakeCase, mapToCamelCase, mapArrayToCamelCase } from '../../utils/mapping'

export async function getAll(query: string = "", status: string = "all") {
  const supabase = await createClient()
  let q = supabase
    .from('purchases')
    .select('*, suppliers(name)')
    .order('order_date', { ascending: false })

  if (query) {
    q = q.or(`notes.ilike.%${query}%,suppliers.name.ilike.%${query}%`)
  }

  if (status !== 'all') {
    q = q.eq('status', status)
  }

  const { data, error } = await q

  if (error) throw error

  // Map data and flatten supplier name
  return data.map(item => ({
    ...mapToCamelCase(item),
    supplierName: item.suppliers?.name || ''
  })) as any[]
}

export async function getById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchases')
    .select('*, suppliers(name), purchase_items(*, inventory(name))')
    .eq('id', id)
    .single()

  if (error) throw error

  // Map and flatten nested data
  const mapped = mapToCamelCase(data)
  return {
    ...mapped,
    supplierName: data.suppliers?.name || '',
    lines: data.purchase_items?.map((item: any) => {
      const mapped = mapToCamelCase(item);
      return {
        ...mapped,
        total: mapped.totalPrice || (mapped.quantity * mapped.unitPrice) || 0,
        productName: item.inventory?.name || ''
      };
    }) || []
  } as any
}

export async function create(purchase: CreatePurchaseOrderDto, items: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('purchases')
    .insert({
      ...mapToSnakeCase(purchase),
      user_id: user?.id
    })
    .select()
    .single()

  if (error) throw error

  const purchaseItems = items.map(item => {
    // Only include fields that exist in purchase_items table
    const { inventoryId, quantity, unitPrice, totalPrice } = item
    return {
      purchase_id: data.id,
      inventory_id: inventoryId,
      quantity: quantity,
      unit_price: unitPrice,
      total_price: totalPrice
    }
  })

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
