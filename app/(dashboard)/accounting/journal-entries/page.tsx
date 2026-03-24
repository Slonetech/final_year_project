import { getAllJournalEntries, getAllAccounts } from "@/lib/supabase/queries/accounting";
import JournalEntriesClient from "./journal-entries-client";

export default async function JournalEntriesPage() {
  const journalEntries = await getAllJournalEntries();
  const accounts = await getAllAccounts();

  return <JournalEntriesClient initialEntries={journalEntries} accounts={accounts} />;
}
