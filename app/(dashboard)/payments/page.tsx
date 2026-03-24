import { getAll } from "@/lib/supabase/queries/payments";
import { getAll as getAllCustomers } from "@/lib/supabase/queries/customers";
import PaymentsClient from "./payments-client";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const type = typeof params.type === "string" ? params.type : "all";

  const payments = await getAll(type);
  const customers = await getAllCustomers();

  return <PaymentsClient initialPayments={payments} customers={customers} type={type} />;
}
