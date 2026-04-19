"use server";

import { revalidatePath } from "next/cache";
import { getAll, getById, create, update, remove } from "@/lib/supabase/queries/customers";
import { CreateCustomerDto, UpdateCustomerDto } from "@/lib/types";

export async function getCustomersAction(query?: string, status: string = "all") {
  return await getAll(query, status);
}

export async function getCustomerAction(id: string) {
  return await getById(id);
}

export async function createCustomerAction(data: CreateCustomerDto) {
  const result = await create(data);
  revalidatePath("/customers");
  return result;
}

export async function updateCustomerAction(id: string, data: UpdateCustomerDto) {
  const result = await update(id, data);
  revalidatePath("/customers");
  return result;
}

export async function deleteCustomerAction(id: string) {
  const result = await remove(id);
  revalidatePath("/customers");
  return result;
}
