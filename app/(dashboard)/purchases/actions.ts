"use server";

import { revalidatePath } from "next/cache";
import { create, getById, remove } from "@/lib/supabase/queries/purchases";

export async function createPurchaseOrderAction(
  purchaseData: any,
  items: any[],
) {
  const result = await create(purchaseData, items);
  revalidatePath("/purchases");
  return result;
}

export async function deletePurchaseOrderAction(id: string) {
  const result = await remove(id);
  revalidatePath("/purchases");
  return result;
}

export async function getPurchaseOrderByIdAction(id: string) {
  return getById(id);
}
