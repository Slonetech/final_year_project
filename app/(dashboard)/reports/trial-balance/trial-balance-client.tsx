"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TrialBalanceData } from "@/lib/types";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { exportToPDF } from "@/lib/utils/pdf-export";
import { exportTrialBalanceToExcel } from "@/lib/utils/excel-export";
import { Download, Printer, Calendar as CalendarIcon, CheckCircle2, XCircle, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function TrialBalanceClient({
  initialData,
  asOfDate: initialDate,
}: {
  initialData: TrialBalanceData;
  asOfDate: Date;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState<Date>(initialDate);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    setDate(newDate);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate.toISOString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePrint = () => window.print();

  const handleExportPDF = async () => {
    try {
      await exportToPDF(
        "trial-balance-report",
        `trial-balance-${format(date, "yyyy-MM-dd")}.pdf`,
        { orientation: "portrait" }
      );
      toast.success("Trial Balance exported to PDF successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
      console.error(error);
    }
  };

  const handleExportExcel = () => {
    try {
      exportTrialBalanceToExcel(
        initialData,
        date,
        `trial-balance-${format(date, "yyyy-MM-dd")}.xlsx`
      );
      toast.success("Trial Balance exported to Excel successfully");
    } catch (error) {
      toast.error("Failed to export Excel");
      console.error(error);
    }
  };

  return (
    <div id="trial-balance-report" className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trial Balance</h1>
          <p className="text-muted-foreground">View your chart of accounts balances</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal" disabled={isPending}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      </div>

      <Card>
        <div className="hidden print:block px-6 pt-6 pb-4 border-b">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Trial Balance</h2>
            <p className="text-muted-foreground mt-1">As of {formatDate(date)}</p>
          </div>
        </div>

        <CardHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trial Balance Report</CardTitle>
              <CardDescription>As of {formatDate(date)}</CardDescription>
            </div>
            {!isPending && initialData && (
              <div className="flex items-center gap-2">
                {initialData.isBalanced ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Balanced</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Out of Balance</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Refreshing trial balance...</p>
              </div>
            </div>
          ) : initialData.accounts.length > 0 ? (
            <div className="space-y-4">
              <div className="hidden print:block mb-4">
                <div className={cn(
                  "p-4 rounded-lg text-center font-medium",
                  initialData.isBalanced
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                )}>
                  {initialData.isBalanced ? "Books are Balanced" : "Books are Out of Balance"}
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">Account Code</TableHead>
                      <TableHead className="font-bold">Account Name</TableHead>
                      <TableHead className="text-right font-bold">Debit</TableHead>
                      <TableHead className="text-right font-bold">Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initialData.accounts.map((account, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{account.accountCode}</TableCell>
                        <TableCell className="font-medium">{account.accountName}</TableCell>
                        <TableCell className="text-right font-mono">
                          {account.debit > 0 ? formatCurrency(account.debit) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {account.credit > 0 ? formatCurrency(account.credit) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-muted font-bold">
                      <TableCell colSpan={2} className="text-lg">Total</TableCell>
                      <TableCell className="text-right text-lg font-mono">
                        {formatCurrency(initialData.totalDebits)}
                      </TableCell>
                      <TableCell className="text-right text-lg font-mono">
                        {formatCurrency(initialData.totalCredits)}
                      </TableCell>
                    </TableRow>
                    {!initialData.isBalanced && (
                      <TableRow className="bg-red-50 dark:bg-red-900/20">
                        <TableCell colSpan={2} className="text-red-600 dark:text-red-400 font-semibold">
                          Difference (Out of Balance)
                        </TableCell>
                        <TableCell colSpan={2} className="text-right text-red-600 dark:text-red-400 font-semibold font-mono">
                          {formatCurrency(Math.abs(initialData.totalDebits - initialData.totalCredits))}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableFooter>
                </Table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 print:mt-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Debits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(initialData.totalDebits)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Credits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(initialData.totalCredits)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      "text-2xl font-bold",
                      initialData.isBalanced ? "text-green-600" : "text-red-600"
                    )}>
                      {initialData.isBalanced ? "Balanced" : "Out of Balance"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
                <p>Generated on {formatDate(new Date())} at {format(new Date(), "p")}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground mb-2">No data available</p>
              <p className="text-sm text-muted-foreground">There are no journal entries or accounts for this date</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="text-base">About Trial Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            The trial balance is a report that lists all accounts and their balances at a specific point in time.
          </p>
          <p>
            The total debits should always equal the total credits. If they don&apos;t match, there may be an error in your journal entries.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Asset and Expense accounts normally have debit balances</li>
            <li>Liability, Equity, and Revenue accounts normally have credit balances</li>
            <li>A balanced trial balance is a prerequisite for accurate financial statements</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
