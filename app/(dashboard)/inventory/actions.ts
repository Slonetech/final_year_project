"use server";

import { revalidatePath } from "next/cache";
import { create, update, remove } from "@/lib/supabase/queries/inventory";
import { CreateProductDto, UpdateProductDto } from "@/lib/types";

export async function createProductAction(data: CreateProductDto) {
  const result = await create(data);
  revalidatePath("/inventory");
  return result;
}

export async function updateProductAction(id: string, data: UpdateProductDto) {
  const result = await update(id, data);
  revalidatePath("/inventory");
  return result;
}

export async function deleteProductAction(id: string) {
  const result = await remove(id);
  revalidatePath("/inventory");
  return result;
}
