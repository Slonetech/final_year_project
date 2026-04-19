import { reportsApi } from "@/lib/supabase/queries/reports";
import AgedPayablesClient from "./aged-payables-client";

export const dynamic = 'force-dynamic';


export default async function AgedPayablesPage() {
  const payables = await reportsApi.getAgedPayables();

  return <AgedPayablesClient initialData={payables} />;
}
