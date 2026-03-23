"use client";

import { useAgedPayables, useExportToPDF, usePrintReport } from "@/hooks/use-reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Download, Printer, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useMemo } from "react";

export default function AgedPayablesPage() {
  const { data: payables, isLoading, error } = useAgedPayables();
  const { exportToPDF } = useExportToPDF();
  const { printReport } = usePrintReport();

  // Calculate totals
  const totals = useMemo(() => {
    if (!payables) return null;

    return payables.reduce(
      (acc, item) => ({
        current: acc.current + item.current,
        days30: acc.days30 + item.days30,
        days60: acc.days60 + item.days60,
        days90: acc.days90 + item.days90,
        over90: acc.over90 + item.over90,
        total: acc.total + item.total,
      }),
      { current: 0, days30: 0, days60: 0, days90: 0, over90: 0, total: 0 }
    );
  }, [payables]);

  // Calculate overdue percentage
  const overduePercentage = useMemo(() => {
    if (!totals || totals.total === 0) return 0;
    const overdue = totals.days30 + totals.days60 + totals.days90 + totals.over90;
    return (overdue / totals.total) * 100;
  }, [totals]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load aged payables</p>
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aged Payables</h1>
          <p className="text-muted-foreground">Track outstanding supplier balances by age</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => printReport()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => exportToPDF("Aged Payables")}>
            <Download className="w-4 h-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {totals && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totals.total)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.current)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.days30 + totals.days60 + totals.days90 + totals.over90)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                overduePercentage > 30 ? "text-red-600" : overduePercentage > 15 ? "text-yellow-600" : "text-green-600"
              )}>
                {overduePercentage.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Card */}
      <Card>
        {/* Print Header - Only visible when printing */}
        <div className="hidden print:block px-6 pt-6 pb-4 border-b">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Aged Payables Report</h2>
            <p className="text-muted-foreground mt-1">
              As of {formatDate(new Date())}
            </p>
          </div>
        </div>

        <CardHeader className="print:hidden">
          <CardTitle>Aged Payables Report</CardTitle>
          <CardDescription>
            As of {formatDate(new Date())}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading aged payables...</p>
              </div>
            </div>
          ) : payables && payables.length > 0 ? (
            <div className="space-y-4">
              {/* Aged Payables Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">Supplier Name</TableHead>
                      <TableHead className="text-right font-bold">Current</TableHead>
                      <TableHead className="text-right font-bold">1-30 Days</TableHead>
                      <TableHead className="text-right font-bold">31-60 Days</TableHead>
                      <TableHead className="text-right font-bold">61-90 Days</TableHead>
                      <TableHead className="text-right font-bold">Over 90 Days</TableHead>
                      <TableHead className="text-right font-bold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payables.map((item) => {
                      const hasOverdue30 = item.days30 > 0 || item.days60 > 0 || item.days90 > 0 || item.over90 > 0;
                      const hasOverdue60 = item.days60 > 0 || item.days90 > 0 || item.over90 > 0;

                      return (
                        <TableRow key={item.supplierId}>
                          <TableCell className="font-medium">
                            {item.supplierName}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {item.current > 0 ? formatCurrency(item.current) : "-"}
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-mono",
                            item.days30 > 0 && "text-yellow-600 dark:text-yellow-500 font-semibold"
                          )}>
                            {item.days30 > 0 ? formatCurrency(item.days30) : "-"}
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-mono",
                            item.days60 > 0 && "text-orange-600 dark:text-orange-500 font-semibold"
                          )}>
                            {item.days60 > 0 ? formatCurrency(item.days60) : "-"}
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-mono",
                            item.days90 > 0 && "text-red-600 dark:text-red-500 font-semibold"
                          )}>
                            {item.days90 > 0 ? formatCurrency(item.days90) : "-"}
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-mono",
                            item.over90 > 0 && "text-red-700 dark:text-red-600 font-bold"
                          )}>
                            {item.over90 > 0 ? formatCurrency(item.over90) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(item.total)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  {totals && (
                    <TableFooter>
                      <TableRow className="bg-muted font-bold">
                        <TableCell className="text-lg">
                          Total
                        </TableCell>
                        <TableCell className="text-right text-lg font-mono">
                          {formatCurrency(totals.current)}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right text-lg font-mono",
                          totals.days30 > 0 && "text-yellow-600 dark:text-yellow-500"
                        )}>
                          {formatCurrency(totals.days30)}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right text-lg font-mono",
                          totals.days60 > 0 && "text-orange-600 dark:text-orange-500"
                        )}>
                          {formatCurrency(totals.days60)}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right text-lg font-mono",
                          totals.days90 > 0 && "text-red-600 dark:text-red-500"
                        )}>
                          {formatCurrency(totals.days90)}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right text-lg font-mono",
                          totals.over90 > 0 && "text-red-700 dark:text-red-600"
                        )}>
                          {formatCurrency(totals.over90)}
                        </TableCell>
                        <TableCell className="text-right text-lg font-mono">
                          {formatCurrency(totals.total)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>

              {/* Alert for high overdue amounts */}
              {overduePercentage > 30 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 print:hidden">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-200">
                      High Overdue Payables Detected
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      {overduePercentage.toFixed(1)}% of your payables are overdue. Overdue payments can damage supplier relationships and may result in late fees or loss of payment terms.
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Priority Alert */}
              {totals && totals.over90 > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 print:hidden">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-200">
                      Urgent Payment Required
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      You have {formatCurrency(totals.over90)} in payables over 90 days old. Prioritize these payments to avoid potential legal action or credit issues.
                    </p>
                  </div>
                </div>
              )}

              {/* Print Footer */}
              <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
                <p>Generated on {formatDate(new Date())} at {format(new Date(), "p")}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground mb-2">No payables data available</p>
              <p className="text-sm text-muted-foreground">
                Outstanding supplier balances will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Legend and Notes */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="text-base">Understanding Aged Payables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              The aged payables report shows the outstanding balances you owe to suppliers, categorized by how long the bills have been unpaid.
            </p>
            <p className="font-medium text-foreground">Color Coding:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <span className="text-yellow-600 dark:text-yellow-500 font-semibold">1-30 Days</span> - Recently due, within normal payment terms
              </li>
              <li>
                <span className="text-orange-600 dark:text-orange-500 font-semibold">31-60 Days</span> - Moderately overdue, may incur late fees
              </li>
              <li>
                <span className="text-red-600 dark:text-red-500 font-semibold">61-90 Days</span> - Significantly overdue, supplier relationship at risk
              </li>
              <li>
                <span className="text-red-700 dark:text-red-600 font-bold">Over 90 Days</span> - Severely overdue, urgent payment required
              </li>
            </ul>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-foreground mb-2">Payment Management Tips:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-muted-foreground">
              <li>Review this report weekly to manage cash flow effectively</li>
              <li>Prioritize payments to key suppliers and those offering early payment discounts</li>
              <li>Contact suppliers proactively if you anticipate payment delays</li>
              <li>Negotiate payment plans for large overdue amounts if needed</li>
              <li>Take advantage of payment terms without hurting supplier relationships</li>
            </ul>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-foreground mb-2">Benefits of Timely Payments:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-muted-foreground">
              <li>Maintain strong supplier relationships</li>
              <li>Preserve early payment discounts and favorable terms</li>
              <li>Avoid late payment fees and interest charges</li>
              <li>Protect your company&apos;s credit rating</li>
              <li>Ensure continuity of supply and service</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
