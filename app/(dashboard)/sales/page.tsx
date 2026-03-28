import { getAll } from "@/lib/supabase/queries/sales";
import { getAll as getAllCustomers } from "@/lib/supabase/queries/customers";
import { getAll as getAllInventory } from "@/lib/supabase/queries/inventory";
import SalesClient from "./sales-client";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const status = typeof params.status === "string" ? params.status : "all";

  const [orders, customers, products] = await Promise.all([
    getAll(query, status),
    getAllCustomers(),
    getAllInventory(),
  ]);

  return (
    <SalesClient
      initialOrders={orders}
      query={query}
      status={status}
      customers={customers}
      products={products}
    />
  );
}
