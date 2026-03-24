import { getAll } from "@/lib/supabase/queries/customers";
import CustomersClient from "./customers-client";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const status = typeof params.status === "string" ? params.status : "all";

  const customers = await getAll(query, status);

  return <CustomersClient initialCustomers={customers} query={query} status={status} />;
}
