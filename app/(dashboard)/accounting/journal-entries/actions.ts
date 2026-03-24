"use server";

import { revalidatePath } from "next/cache";
import { createJournalEntry } from "@/lib/supabase/queries/accounting";

export async function createJournalEntryAction(data: any) {
  const result = await createJournalEntry(data);
  revalidatePath("/accounting/journal-entries");
  return result;
}
