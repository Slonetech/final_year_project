import { getAll } from "@/lib/supabase/queries/invoices";
import InvoicesClient from "./invoices-client";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "all";

  const invoices = await getAll(status);

  return <InvoicesClient initialInvoices={invoices} status={status} />;
}
