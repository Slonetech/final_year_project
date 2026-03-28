"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import dynamic from "next/dynamic";

const SalesChart = dynamic(() => import("@/components/dashboard/sales-chart"), {
  loading: () => (
    <div className="h-[300px] w-full flex items-center justify-center">
      <p className="text-muted-foreground">Loading chart...</p>
    </div>
  ),
});

export default function DashboardClient({
  kpis,
  transactions,
  topCustomers,
  lowStockAlerts,
  salesData
}: {
  kpis: any,
  transactions: any[],
  topCustomers: any[],
  lowStockAlerts: any[],
  salesData: any[]
}) {

  const kpiCards = [
    {
      title: "Total Revenue",
      value: kpis?.totalRevenue || 0,
      change: kpis?.revenueChange || 0,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Expenses",
      value: kpis?.totalExpenses || 0,
      change: kpis?.expensesChange || 0,
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      title: "Net Profit",
      value: kpis?.netProfit || 0,
      change: kpis?.profitChange || 0,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Cash Balance",
      value: kpis?.cashBalance || 0,
      change: kpis?.cashChange || 0,
      icon: Wallet,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your financial performance
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpi.value)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {kpi.change > 0 ? (
                  <ArrowUp className="w-3 h-3 text-green-600" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-red-600" />
                )}
                <span className={kpi.change > 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(kpi.change)}%
                </span>
                <span>from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Sales & Expenses Trend</CardTitle>
          <CardDescription>Last 10 months performance</CardDescription>
        </CardHeader>
        <CardContent>
          <SalesChart data={salesData} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest 10 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions && transactions.length > 0 ? (
                transactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.reference} • {formatDate(transaction.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={transaction.status === "paid" ? "default" : "secondary"}>
                        {transaction.status}
                      </Badge>
                      <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>By revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers && topCustomers.length > 0 ? (
                  topCustomers.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(customer.revenue)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">No customer data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>Products below reorder point</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lowStockAlerts && lowStockAlerts.length > 0 ? (
              lowStockAlerts.map((alert: any) => (
                <div key={alert.productId} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{alert.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      Reorder at: {alert.reorderPoint} units
                    </p>
                  </div>
                  <Badge variant="destructive">{alert.currentStock} units</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                All stock levels are healthy
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
