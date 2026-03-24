import { createClient } from '../server';
import { PurchaseOrder, PurchaseOrderStatus } from '@/lib/types';

const mapFromDb = (data: any): PurchaseOrder => {
  return {
    id: data.id,
    orderNumber: `PO-${data.id.substring(0, 6).toUpperCase()}`,
    supplierId: data.supplier_id || '',
    supplierName: data.suppliers?.name || 'Unknown Supplier',
    orderDate: data.purchase_date,
    expectedDate: data.purchase_date, // simplified for now
    status: (data.status || 'draft') as PurchaseOrderStatus,
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
  let q = supabase.from('purchases').select('*, suppliers(name)').order('purchase_date', { ascending: false });
  
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
         o.supplierName.toLowerCase().includes(lowerQuery)
      );
  }
  return orders;
}

export async function getById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('purchases').select('*, suppliers(name)').eq('id', id).single();
  if (error) throw error;
  return mapFromDb(data);
}

// Omitted Create/Update for now since it's just a view page according to original implementation
// Only delete is used

export async function remove(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('purchases').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export { remove as delete };
