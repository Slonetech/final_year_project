import { getAll } from "@/lib/supabase/queries/sales";
import SalesClient from "./sales-client";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const status = typeof params.status === "string" ? params.status : "all";

  const orders = await getAll(query, status);

  return <SalesClient initialOrders={orders} query={query} status={status} />;
}
