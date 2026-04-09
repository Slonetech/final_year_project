import { createClient } from '../server'
import { SalesOrder, CreateSalesOrderDto } from '@/lib/types'
import { mapToSnakeCase, mapToCamelCase, mapArrayToCamelCase } from '../../utils/mapping'

export async function getAll(query: string = "", status: string = "all") {
  const supabase = await createClient()
  let q = supabase
    .from('sales')
    .select('*, customers(name)')
    .order('order_date', { ascending: false })

  if (query) {
    q = q.or(`notes.ilike.%${query}%,customers.name.ilike.%${query}%`)
  }

  if (status !== 'all') {
    q = q.eq('status', status)
  }

  const { data, error } = await q

  if (error) throw error

  // Map data and flatten customer name
  return data.map(item => ({
    ...mapToCamelCase(item),
    customerName: item.customers?.name || ''
  })) as any[]
}

export async function getById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales')
    .select('*, customers(name), sale_items(*, inventory(name))')
    .eq('id', id)
    .single()

  if (error) throw error

  // Map and flatten nested data
  const mapped = mapToCamelCase(data)
  return {
    ...mapped,
    customerName: data.customers?.name || '',
    lines: data.sale_items?.map((item: any) => {
      const mapped = mapToCamelCase(item);
      return {
        ...mapped,
        total: mapped.totalPrice || (mapped.quantity * mapped.unitPrice) || 0,
        productName: item.inventory?.name || ''
      };
    }) || []
  } as any
}

export async function create(sale: CreateSalesOrderDto, items: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Calculate totals from items
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const taxRate = sale.taxRate || 16.00
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const { data, error } = await supabase
    .from('sales')
    .insert({
      ...mapToSnakeCase(sale),
      user_id: user?.id,
      created_by: user?.id,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total
    })
    .select()
    .single()

  if (error) throw error

  const saleItems = items.map(item => {
    // Only include fields that exist in sale_items table
    const { inventoryId, quantity, unitPrice, totalPrice } = item
    return {
      sale_id: data.id,
      inventory_id: inventoryId,
      quantity: quantity,
      unit_price: unitPrice,
      total_price: totalPrice
    }
  })

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems)

  if (itemsError) throw itemsError

  return mapToCamelCase(data)
}

export async function update(id: string, sale: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales')
    .update(mapToSnakeCase(sale))
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return mapToCamelCase(data)
}

export async function remove(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}
