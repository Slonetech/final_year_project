import { getAll } from "@/lib/supabase/queries/inventory";
import InventoryClient from "./inventory-client";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const category = typeof params.category === "string" ? params.category : "all";

  const products = await getAll(query, category);

  return <InventoryClient initialProducts={products} query={query} category={category} />;
}
