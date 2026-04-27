"use server";

import { revalidatePath } from "next/cache";
import { create, remove, getById } from "@/lib/supabase/queries/sales";
import { fromSalesOrder } from "@/lib/supabase/queries/invoices";

export async function getSalesOrderByIdAction(id: string) {
  return await getById(id);
}

export async function createSalesOrderAction(salesData: any, items: any[]) {
  const result = await create(salesData, items);
  revalidatePath("/sales");
  revalidatePath("/");
  return result;
}

export async function deleteSalesOrderAction(id: string) {
  const result = await remove(id);
  revalidatePath("/sales");
  revalidatePath("/");
  return result;
}

export async function convertToInvoiceAction(saleId: string) {
  const result = await fromSalesOrder(saleId);
  revalidatePath("/sales");
  revalidatePath("/invoices");
  revalidatePath("/");
  return result;
}

