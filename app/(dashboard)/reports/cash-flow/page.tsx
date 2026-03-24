import { reportsApi } from "@/lib/supabase/queries/reports";
import CashFlowClient from "./cash-flow-client";

export default async function CashFlowPage({
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
  
  const cashFlow = await reportsApi.getCashFlow(startDate, endDate);

  return <CashFlowClient initialData={cashFlow} startDate={startDate} endDate={endDate} />;
}
