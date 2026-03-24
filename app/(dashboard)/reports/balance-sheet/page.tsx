import { reportsApi } from "@/lib/supabase/queries/reports";
import BalanceSheetClient from "./balance-sheet-client";

export default async function BalanceSheetPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const asOfDate = searchParams.date ? new Date(searchParams.date) : new Date();
  
  const balanceSheet = await reportsApi.getBalanceSheet(asOfDate);

  return <BalanceSheetClient initialData={balanceSheet} asOfDate={asOfDate} />;
}
