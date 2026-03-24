import { getAll } from "@/lib/supabase/queries/purchases";
import PurchasesClient from "./purchases-client";

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const status = typeof params.status === "string" ? params.status : "all";

  const orders = await getAll(query, status);

  return <PurchasesClient initialOrders={orders} query={query} status={status} />;
}
