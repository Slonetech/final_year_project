import { createClient } from '../server';
import { Payment } from '@/lib/types';

const mapFromDb = (data: any): Payment => {
  return {
    id: data.id,
    paymentNumber: `PAY-${data.id.substring(0, 6).toUpperCase()}`,
    invoiceId: data.invoice_id || undefined,
    customerId: data.customer_id || undefined,
    customerName: data.customers?.name || 'Unknown',
    supplierId: undefined,
    supplierName: undefined,
    date: data.payment_date,
    amount: data.amount,
    method: (data.payment_method || 'mpesa') as any,
    reference: data.reference || '',
    type: 'received', // schema currently only supports received payments via customers
    notes: '',
    status: 'completed',
    createdAt: data.created_at,
    updatedAt: data.created_at,
  };
};

export async function getAll(type?: string) {
  const supabase = await createClient();
  let q = supabase.from('payments').select('*, customers(name)').order('payment_date', { ascending: false });
  
  const { data, error } = await q;
  if (error) throw error;
  
  let payments = (data || []).map(mapFromDb);
  if (type && type !== 'all') {
    payments = payments.filter((p) => p.type === type);
  }
  return payments;
}

export async function getById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('payments').select('*, customers(name)').eq('id', id).single();
  if (error) throw error;
  return mapFromDb(data);
}

export async function create(record: any) {
  const supabase = await createClient();
  const dbRecord = {
    amount: record.amount,
    payment_method: record.method,
    reference: record.reference,
    payment_date: record.date || new Date().toISOString(),
    customer_id: record.customerId || null,
  };
  const { data, error } = await supabase.from('payments').insert(dbRecord).select().single();
  if (error) throw error;
  return mapFromDb(data);
}

export async function remove(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export { remove as delete };
