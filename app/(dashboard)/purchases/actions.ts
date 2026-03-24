"use server";

import { revalidatePath } from "next/cache";
import { remove } from "@/lib/supabase/queries/purchases";

export async function deletePurchaseOrderAction(id: string) {
  const result = await remove(id);
  revalidatePath("/purchases");
  return result;
}
