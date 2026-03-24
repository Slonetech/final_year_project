import { reportsApi } from "@/lib/supabase/queries/reports";
import ProfitLossClient from "./profit-loss-client";

export default async function ProfitLossPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string };
}) {
  const defaultStart = new Date();
  defaultStart.setDate(1); // First day of current month
  defaultStart.setHours(0, 0, 0, 0);

  const defaultEnd = new Date();
  defaultEnd.setHours(23, 59, 59, 999);

  const startDate = searchParams.startDate ? new Date(searchParams.startDate) : defaultStart;
  const endDate = searchParams.endDate ? new Date(searchParams.endDate) : defaultEnd;
  
  const profitLoss = await reportsApi.getProfitLoss(startDate, endDate);

  return <ProfitLossClient initialData={profitLoss} startDate={startDate} endDate={endDate} />;
}
