import { reportsApi } from "@/lib/supabase/queries/reports";
import TrialBalanceClient from "./trial-balance-client";

export default async function TrialBalancePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const asOfDate = searchParams.date ? new Date(searchParams.date) : new Date();
  
  const trialBalance = await reportsApi.getTrialBalance(asOfDate);

  return <TrialBalanceClient initialData={trialBalance} asOfDate={asOfDate} />;
}
