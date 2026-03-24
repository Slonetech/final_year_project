import { createClient } from '../server';
import { Product, CreateProductDto, UpdateProductDto } from '@/lib/types';

const mapToDb = (data: any) => {
  const result: any = { ...data };
  if (data.costPrice !== undefined) result.cost_price = data.costPrice;
  if (data.sellingPrice !== undefined) result.selling_price = data.sellingPrice;
  if (data.stockLevel !== undefined) result.stock_level = data.stockLevel;
  if (data.reorderPoint !== undefined) result.reorder_point = data.reorderPoint;
  if (data.reorderQuantity !== undefined) result.reorder_quantity = data.reorderQuantity;
  delete result.costPrice;
  delete result.sellingPrice;
  delete result.stockLevel;
  delete result.reorderPoint;
  delete result.reorderQuantity;
  delete result.createdAt;
  delete result.updatedAt;
  return result;
};

const mapFromDb = (data: any): Product => {
  return {
    ...data,
    costPrice: data.cost_price || 0,
    sellingPrice: data.selling_price || 0,
    stockLevel: data.stock_level || 0,
    reorderPoint: data.reorder_point || 0,
    reorderQuantity: data.reorder_quantity || 0,
  };
};

export async function getAll(query?: string, category?: string) {
  const supabase = await createClient();
  let q = supabase.from('inventory').select('*').order('name');
  if (query) {
    q = q.ilike('name', `%${query}%`);
  }
  if (category && category !== 'all') {
    q = q.eq('category', category);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapFromDb);
}

export async function getById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('inventory').select('*').eq('id', id).single();
  if (error) throw error;
  return mapFromDb(data);
}

export async function create(record: CreateProductDto) {
  const supabase = await createClient();
  const dbRecord = mapToDb(record);
  const { data, error } = await supabase.from('inventory').insert(dbRecord).select().single();
  if (error) throw error;
  return mapFromDb(data);
}

export async function update(id: string, record: UpdateProductDto) {
  const supabase = await createClient();
  const dbRecord = mapToDb(record);
  const { data, error } = await supabase.from('inventory').update(dbRecord).eq('id', id).select().single();
  if (error) throw error;
  return mapFromDb(data);
}

export async function remove(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('inventory').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export { remove as delete };
