"use server";

import { revalidatePath } from "next/cache";
import { create, update, remove } from "@/lib/supabase/queries/accounting";

export async function createAccountAction(data: any) {
  const result = await create(data);
  revalidatePath("/accounting/chart-of-accounts");
  return result;
}

export async function updateAccountAction(id: string, data: any) {
  const result = await update(id, data);
  revalidatePath("/accounting/chart-of-accounts");
  return result;
}

export async function deleteAccountAction(id: string) {
  const result = await remove(id);
  revalidatePath("/accounting/chart-of-accounts");
  return result;
}
