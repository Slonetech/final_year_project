"use server";

import { revalidatePath } from "next/cache";
import { create, remove, getById } from "@/lib/supabase/queries/sales";

export async function getSalesOrderByIdAction(id: string) {
  return await getById(id);
}

export async function createSalesOrderAction(salesData: any, items: any[]) {
  const result = await create(salesData, items);
  revalidatePath("/sales");
  return result;
}

export async function deleteSalesOrderAction(id: string) {
  const result = await remove(id);
  revalidatePath("/sales");
  return result;
}
