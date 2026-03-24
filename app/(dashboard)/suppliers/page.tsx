import { getAll } from "@/lib/supabase/queries/suppliers";
import SuppliersClient from "./suppliers-client";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const status = typeof params.status === "string" ? params.status : "all";

  const suppliers = await getAll(query, status);

  return <SuppliersClient initialSuppliers={suppliers} query={query} status={status} />;
}
