import { reportsApi } from "@/lib/supabase/queries/reports";
import AgedReceivablesClient from "./aged-receivables-client";

export const dynamic = 'force-dynamic';


export default async function AgedReceivablesPage() {
  const receivables = await reportsApi.getAgedReceivables();

  return <AgedReceivablesClient initialData={receivables} />;
}
