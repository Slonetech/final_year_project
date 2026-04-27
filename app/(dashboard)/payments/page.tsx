import { getAll } from "@/lib/supabase/queries/payments";
import { getAll as getAllCustomers } from "@/lib/supabase/queries/customers";
import { getAll as getAllSuppliers } from "@/lib/supabase/queries/suppliers";
import PaymentsClient from "./payments-client";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const type = typeof params.type === "string" ? params.type : "all";

  const payments = await getAll(type);
  const [customers, suppliers] = await Promise.all([
    getAllCustomers(),
    getAllSuppliers()
  ]);

  return (
    <PaymentsClient 
      initialPayments={payments} 
      customers={customers} 
      suppliers={suppliers} 
      type={type} 
    />
  );
}

