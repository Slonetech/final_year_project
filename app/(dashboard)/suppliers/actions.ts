"use server";

import { revalidatePath } from "next/cache";
import { create, update, remove } from "@/lib/supabase/queries/suppliers";
import { CreateSupplierDto, UpdateSupplierDto } from "@/lib/types";

export async function createSupplierAction(data: CreateSupplierDto) {
  const result = await create(data);
  revalidatePath("/suppliers");
  return result;
}

export async function updateSupplierAction(id: string, data: UpdateSupplierDto) {
  const result = await update(id, data);
  revalidatePath("/suppliers");
  return result;
}

export async function deleteSupplierAction(id: string) {
  const result = await remove(id);
  revalidatePath("/suppliers");
  return result;
}
