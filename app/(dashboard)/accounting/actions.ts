"use server";

import { revalidatePath } from "next/cache";
import {
  getAllAccounts,
  getAllJournalEntries,
  createAccount,
  createJournalEntry,
  updateAccount,
  deleteAccount,
} from "@/lib/supabase/queries/accounting";

// ── Chart of Accounts ────────────────────────────────────────────────────────

export async function getAllAccountsAction() {
  return getAllAccounts();
}

export async function createAccountAction(data: any) {
  const result = await createAccount(data);
  revalidatePath("/accounting");
  return result;
}

export async function updateAccountAction(id: string, data: any) {
  const result = await updateAccount(id, data);
  revalidatePath("/accounting");
  return result;
}

export async function deleteAccountAction(id: string) {
  const result = await deleteAccount(id);
  revalidatePath("/accounting");
  return result;
}

// ── Journal Entries ──────────────────────────────────────────────────────────

export async function getAllJournalEntriesAction(filters?: { query?: string; status?: string }) {
  const entries = await getAllJournalEntries();
  // Apply filters client-side since the query returns all entries
  let result = entries;
  if (filters?.status && filters.status !== "all") {
    result = result.filter((e: any) => e.status === filters.status);
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (e: any) =>
        e.description?.toLowerCase().includes(q) ||
        e.reference?.toLowerCase().includes(q) ||
        e.entryNumber?.toLowerCase().includes(q)
    );
  }
  return result;
}

export async function createJournalEntryAction(entry: any, lines: any[]) {
  const result = await createJournalEntry(entry, lines);
  revalidatePath("/accounting");
  return result;
}
