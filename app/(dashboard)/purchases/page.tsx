import { getAll } from "@/lib/supabase/queries/purchases";
import { getAll as getAllSuppliers } from "@/lib/supabase/queries/suppliers";
import { getAll as getAllInventory } from "@/lib/supabase/queries/inventory";
import PurchasesClient from "./purchases-client";

export default async function PurchasesPage() {
  const [orders, suppliers, products] = await Promise.all([
    getAll(), // Fetch all orders without filtering
    getAllSuppliers(),
    getAllInventory(),
  ]);

  return (
    <PurchasesClient
      initialOrders={orders}
      suppliers={suppliers}
      products={products}
    />
  );
}
