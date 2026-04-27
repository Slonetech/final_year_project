"use server";

import { revalidatePath } from "next/cache";
import { getCompanySettings, updateCompanySettings, getTaxSettings, updateTaxSettings, getInvoiceSettings, updateInvoiceSettings } from "@/lib/supabase/queries/settings";
import { CompanySettings, TaxSettings, InvoiceSettings } from "@/lib/types";

export async function getCompanySettingsAction() {
  return await getCompanySettings();
}

export async function updateCompanySettingsAction(data: Partial<Omit<CompanySettings, 'id' | 'updatedAt'>>) {
  const result = await updateCompanySettings(data);
  revalidatePath("/settings");
  return result;
}

export async function getTaxSettingsAction() {
  return await getTaxSettings();
}

export async function updateTaxSettingsAction(
  data: Partial<Omit<TaxSettings, 'id' | 'updatedAt'>>
) {
  const result = await updateTaxSettings(data);
  revalidatePath("/settings");
  return result;
}

export async function getInvoiceSettingsAction() {
  return await getInvoiceSettings();
}

export async function updateInvoiceSettingsAction(
  data: Partial<Omit<InvoiceSettings, 'id' | 'updatedAt'>>
) {
  const result = await updateInvoiceSettings(data);
  revalidatePath("/settings");
  return result;
}
