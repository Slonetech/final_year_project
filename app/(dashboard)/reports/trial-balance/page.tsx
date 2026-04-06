import { reportsApi } from "@/lib/supabase/queries/reports";
import TrialBalanceClient from "./trial-balance-client";

export default async function TrialBalancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const resolvedParams = await searchParams;
  const asOfDate = resolvedParams.date ? new Date(resolvedParams.date) : new Date();
  
  const trialBalance = await reportsApi.getTrialBalance(asOfDate);

  return <TrialBalanceClient initialData={trialBalance} asOfDate={asOfDate} />;
}
