import { createClient } from '../server';
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/lib/types';

const mapToDb = (data: any) => {
  const result: any = { ...data };
  if (data.contactPerson !== undefined) result.contact_person = data.contactPerson;
  if (data.paymentTerms !== undefined) result.payment_terms = data.paymentTerms;
  if (data.creditLimit !== undefined) result.credit_limit = data.creditLimit;
  delete result.contactPerson;
  delete result.paymentTerms;
  delete result.creditLimit;
  delete result.createdAt;
  delete result.updatedAt;
  return result;
};

const mapFromDb = (data: any): Customer => {
  return {
    ...data,
    contactPerson: data.contact_person || '',
    paymentTerms: data.payment_terms || 30,
    creditLimit: data.credit_limit || 0,
    balance: data.balance || 0,
    status: data.status || 'active',
  };
};

export async function getAll(query?: string, status?: string) {
  const supabase = await createClient();
  let q = supabase.from('customers').select('*').order('name');
  if (query) {
    q = q.ilike('name', `%${query}%`);
  }
  if (status && status !== 'all') {
    q = q.eq('status', status);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapFromDb);
}

export async function getById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
  if (error) throw error;
  return mapFromDb(data);
}

export async function create(record: CreateCustomerDto) {
  const supabase = await createClient();
  const dbRecord = mapToDb(record);
  const { data, error } = await supabase.from('customers').insert(dbRecord).select().single();
  if (error) throw error;
  return mapFromDb(data);
}

export async function update(id: string, record: UpdateCustomerDto) {
  const supabase = await createClient();
  const dbRecord = mapToDb(record);
  const { data, error } = await supabase.from('customers').update(dbRecord).eq('id', id).select().single();
  if (error) throw error;
  return mapFromDb(data);
}

export async function remove(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export { remove as delete };
