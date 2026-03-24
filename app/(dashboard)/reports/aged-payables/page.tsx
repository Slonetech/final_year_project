import { reportsApi } from "@/lib/supabase/queries/reports";
import AgedPayablesClient from "./aged-payables-client";

export default async function AgedPayablesPage() {
  const payables = await reportsApi.getAgedPayables();

  return <AgedPayablesClient initialData={payables} />;
}
