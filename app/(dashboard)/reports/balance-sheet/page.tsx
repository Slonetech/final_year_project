import { reportsApi } from "@/lib/supabase/queries/reports";
import BalanceSheetClient from "./balance-sheet-client";

export const dynamic = 'force-dynamic';


export default async function BalanceSheetPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const resolvedParams = await searchParams;
  const asOfDate = resolvedParams.date ? new Date(resolvedParams.date) : new Date();
  
  const balanceSheet = await reportsApi.getBalanceSheet(asOfDate);

  return <BalanceSheetClient initialData={balanceSheet} asOfDate={asOfDate} />;
}
