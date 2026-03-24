"use server";

import { revalidatePath } from "next/cache";
import { create, remove } from "@/lib/supabase/queries/payments";

export async function createPaymentAction(data: any) {
  const result = await create(data);
  revalidatePath("/payments");
  return result;
}

export async function deletePaymentAction(id: string) {
  const result = await remove(id);
  revalidatePath("/payments");
  return result;
}
