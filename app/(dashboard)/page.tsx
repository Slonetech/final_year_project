import { getDashboardKPIs, getRecentTransactions, getLowStockAlerts, getTopCustomers, getSalesExpensesTrend } from "@/lib/supabase/queries/dashboard";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const kpis = await getDashboardKPIs();
  const transactions = await getRecentTransactions();
  const topCustomers = await getTopCustomers();
  const lowStockAlerts = await getLowStockAlerts();
  const salesData = await getSalesExpensesTrend();

  return (
    <DashboardClient
      kpis={kpis}
      transactions={transactions}
      topCustomers={topCustomers}
      lowStockAlerts={lowStockAlerts}
      salesData={salesData}
    />
  );
}
