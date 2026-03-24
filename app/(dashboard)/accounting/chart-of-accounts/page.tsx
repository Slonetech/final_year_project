import { getAll } from "@/lib/supabase/queries/accounting";
import ChartOfAccountsClient from "./chart-of-accounts-client";

export default async function ChartOfAccountsPage() {
  const accounts = await getAll();

  return <ChartOfAccountsClient initialAccounts={accounts} />;
}
