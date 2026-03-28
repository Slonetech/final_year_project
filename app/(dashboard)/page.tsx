import { getDashboardKPIs, getRecentTransactions, getLowStockAlerts, getTopCustomers } from "@/lib/supabase/queries/dashboard";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const kpis = await getDashboardKPIs();
  const transactions = await getRecentTransactions();
  const topCustomers = await getTopCustomers();
  const lowStockAlerts = await getLowStockAlerts();

  return (
    <DashboardClient 
      kpis={kpis} 
      transactions={transactions} 
      topCustomers={topCustomers} 
      lowStockAlerts={lowStockAlerts} 
    />
  );
}
