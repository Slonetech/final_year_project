"use server";

import { revalidatePath } from "next/cache";
import { remove } from "@/lib/supabase/queries/sales";

export async function deleteSalesOrderAction(id: string) {
  const result = await remove(id);
  revalidatePath("/sales");
  return result;
}
