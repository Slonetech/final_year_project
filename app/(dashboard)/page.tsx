"use client";

import { useQuery } from "@tanstack/react-query";
import { mockDashboardApi } from "@/lib/api/mock-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: () => mockDashboardApi.getKPIs(),
  });

  const { data: transactions } = useQuery({
    queryKey: ["dashboard", "transactions"],
    queryFn: () => mockDashboardApi.getRecentTransactions(),
  });

  const { data: topCustomers } = useQuery({
    queryKey: ["dashboard", "topCustomers"],
    queryFn: () => mockDashboardApi.getTopCustomers(),
  });

  const { data: topProducts } = useQuery({
    queryKey: ["dashboard", "topProducts"],
    queryFn: () => mockDashboardApi.getTopProducts(),
  });

  const { data: salesData } = useQuery({
    queryKey: ["dashboard", "salesChart"],
    queryFn: () => mockDashboardApi.getSalesChartData(),
  });

  const { data: lowStockAlerts } = useQuery({
    queryKey: ["dashboard", "lowStock"],
    queryFn: () => mockDashboardApi.getLowStockAlerts(),
  });

  if (kpisLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial performance
        </p>
      </div>

      {/* KPI Cards */}
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

      {/* Sales Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Sales & Expenses Trend</CardTitle>
          <CardDescription>Last 10 months performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Sales
                            </span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(payload[0].value as number)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Expenses
                            </span>
                            <span className="font-bold text-red-600">
                              {formatCurrency(payload[1].value as number)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-2))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest 10 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions?.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.reference} • {formatDate(transaction.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {transaction.status && (
                      <Badge variant={transaction.status === "paid" ? "default" : "secondary"}>
                        {transaction.status}
                      </Badge>
                    )}
                    <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
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
                  <TableHead className="text-right">Invoices</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers?.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(customer.revenue)}</TableCell>
                    <TableCell className="text-right">{customer.invoiceCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best sellers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">{product.quantitySold}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
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
                lowStockAlerts.map((alert) => (
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
    </div>
  );
}
