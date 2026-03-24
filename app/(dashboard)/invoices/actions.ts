"use server";

import { revalidatePath } from "next/cache";
import { remove } from "@/lib/supabase/queries/invoices";

export async function deleteInvoiceAction(id: string) {
  const result = await remove(id);
  revalidatePath("/invoices");
  return result;
}
