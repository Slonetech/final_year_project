"use server";

import { revalidatePath } from "next/cache";
import { create, remove } from "@/lib/supabase/queries/purchases";

export async function createPurchaseOrderAction(purchaseData: any, items: any[]) {
  const result = await create(purchaseData, items);
  revalidatePath("/purchases");
  return result;
}

export async function deletePurchaseOrderAction(id: string) {
  const result = await remove(id);
  revalidatePath("/purchases");
  return result;
}
