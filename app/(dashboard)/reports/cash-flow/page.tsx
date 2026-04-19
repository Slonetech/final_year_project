import { reportsApi } from "@/lib/supabase/queries/reports";
import CashFlowClient from "./cash-flow-client";

export const dynamic = 'force-dynamic';


export default async function CashFlowPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const resolvedParams = await searchParams;

  const defaultStart = new Date();
  defaultStart.setDate(1); // First day of current month
  defaultStart.setHours(0, 0, 0, 0);

  const defaultEnd = new Date();
  defaultEnd.setHours(23, 59, 59, 999);

  const startDate = resolvedParams.startDate ? new Date(resolvedParams.startDate) : defaultStart;
  const endDate = resolvedParams.endDate ? new Date(resolvedParams.endDate) : defaultEnd;
  
  const cashFlow = await reportsApi.getCashFlow(startDate, endDate);

  return <CashFlowClient initialData={cashFlow} startDate={startDate} endDate={endDate} />;
}
