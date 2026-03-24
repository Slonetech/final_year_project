import { createClient } from '../server';
import { Invoice } from '@/lib/types';

const mapFromDb = (data: any): Invoice => {
  return {
    id: data.id,
    invoiceNumber: data.invoice_number,
    customerId: data.customer_id || '',
    customerName: data.customers?.name || 'Unknown Customer',
    salesOrderId: data.sale_id || undefined,
    invoiceDate: data.issue_date,
    dueDate: data.due_date,
    status: (data.status || 'draft') as any,
    items: [],
    subtotal: data.total_amount || 0,
    tax: 0,
    total: data.total_amount || 0,
    amountPaid: 0, // This would ideally be computed from payments table
    amountDue: data.total_amount || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export async function getAll(status?: string) {
  const supabase = await createClient();
  let q = supabase.from('invoices').select('*, customers(name)').order('issue_date', { ascending: false });
  
  if (status && status !== 'all') {
    q = q.eq('status', status);
  }
  
  const { data, error } = await q;
  if (error) throw error;
  
  return (data || []).map(mapFromDb);
}

export async function getById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('invoices').select('*, customers(name)').eq('id', id).single();
  if (error) throw error;
  return mapFromDb(data);
}

export async function remove(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export { remove as delete };
