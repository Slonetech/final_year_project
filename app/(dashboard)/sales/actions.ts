"use server";

import { revalidatePath } from "next/cache";
import { create, remove } from "@/lib/supabase/queries/sales";

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
