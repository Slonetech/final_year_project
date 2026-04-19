"use server";

import { revalidatePath } from "next/cache";
import { getAll, getById, create, update, remove } from "@/lib/supabase/queries/invoices";
import { CreateInvoiceDto } from "@/lib/types";

export async function getInvoicesAction(status: string = "all") {
  return await getAll(status);
}

export async function getInvoiceAction(id: string) {
  return await getById(id);
}

export async function createInvoiceAction(data: CreateInvoiceDto) {
  const result = await create(data);
  revalidatePath("/invoices");
  revalidatePath("/reports/trial-balance");
  revalidatePath("/reports/balance-sheet");
  revalidatePath("/reports/profit-loss");
  return result;
}


export async function updateInvoiceAction(id: string, data: any) {
  const result = await update(id, data);
  revalidatePath("/invoices");
  revalidatePath("/reports/trial-balance");
  revalidatePath("/reports/balance-sheet");
  revalidatePath("/reports/profit-loss");
  return result;
}


export async function deleteInvoiceAction(id: string) {
  const result = await remove(id);
  revalidatePath("/invoices");
  revalidatePath("/reports/trial-balance");
  revalidatePath("/reports/balance-sheet");
  revalidatePath("/reports/profit-loss");
  return result;
}


