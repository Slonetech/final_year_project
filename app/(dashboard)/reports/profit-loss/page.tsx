import { reportsApi } from "@/lib/supabase/queries/reports";
import ProfitLossClient from "./profit-loss-client";

export default async function ProfitLossPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const { startDate: startDateParam, endDate: endDateParam } = await searchParams;

  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 90); // Default to last 90 days
  defaultStart.setHours(0, 0, 0, 0);

  const defaultEnd = new Date();
  defaultEnd.setHours(23, 59, 59, 999);

  const startDate = startDateParam ? new Date(startDateParam) : defaultStart;
  const endDate = endDateParam ? new Date(endDateParam) : defaultEnd;
  
  const profitLoss = await reportsApi.getProfitLoss(startDate, endDate);

  return <ProfitLossClient initialData={profitLoss} startDate={startDate} endDate={endDate} />;
}
