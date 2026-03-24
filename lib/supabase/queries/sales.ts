import { createClient } from '../server';
import { SalesOrder, SalesOrderStatus } from '@/lib/types';

const mapFromDb = (data: any): SalesOrder => {
  return {
    id: data.id,
    orderNumber: `SO-${data.id.substring(0, 6).toUpperCase()}`,
    customerId: data.customer_id || '',
    customerName: data.customers?.name || 'Unknown Customer',
    orderDate: data.sale_date,
    deliveryDate: data.sale_date,
    status: (data.status || 'quote') as SalesOrderStatus,
    items: [],
    subtotal: data.total_amount || 0,
    tax: 0,
    total: data.total_amount || 0,
    notes: data.notes || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export async function getAll(query?: string, status?: string) {
  const supabase = await createClient();
  let q = supabase.from('sales').select('*, customers(name)').order('sale_date', { ascending: false });
  
  if (status && status !== 'all') {
    q = q.eq('status', status);
  }
  
  const { data, error } = await q;
  if (error) throw error;
  
  let orders = (data || []).map(mapFromDb);
  if (query) {
      const lowerQuery = query.toLowerCase();
      orders = orders.filter(o => 
         o.orderNumber.toLowerCase().includes(lowerQuery) || 
         o.customerName.toLowerCase().includes(lowerQuery)
      );
  }
  return orders;
}

export async function getById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('sales').select('*, customers(name)').eq('id', id).single();
  if (error) throw error;
  return mapFromDb(data);
}

export async function remove(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('sales').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export { remove as delete };
