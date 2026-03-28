"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ProfitLossData } from "@/lib/types";
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
import { exportProfitLossToExcel } from "@/lib/utils/excel-export";
import { Printer, Calendar as CalendarIcon, ArrowRight, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ProfitLossClient({
  initialData,
  startDate: initialStart,
  endDate: initialEnd,
}: {
  initialData: ProfitLossData;
  startDate: Date;
  endDate: Date;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date | undefined }>({
      from: initialStart,
      to: initialEnd,
  });

  const handleApplyDateRange = () => {
      if (!dateRange.from) return;
      
      const params = new URLSearchParams(searchParams.toString());
      params.set("startDate", dateRange.from.toISOString());
      if (dateRange.to) params.set("endDate", dateRange.to.toISOString());
      
      startTransition(() => {
          router.push(`${pathname}?${params.toString()}`);
      });
  };

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    try {
      exportProfitLossToExcel(
        initialData,
        dateRange.from,
        dateRange.to || new Date(),
        `profit-loss-${format(dateRange.from, "yyyy-MM-dd")}-to-${dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "present"}.xlsx`
      );
      toast.success("Profit & Loss report exported to Excel successfully");
    } catch (error) {
      toast.error("Failed to export Excel");
      console.error(error);
    }
  };

  return (
        <div id="profit-loss-report" className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profit & Loss</h1>
                    <p className="text-muted-foreground">Income statement for a specific period</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal" disabled={isPending}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange.from}
                                selected={dateRange}
                                onSelect={(range) => range && setDateRange({ from: range.from || new Date(), to: range.to })}
                                numberOfMonths={2}
                            />
                            <div className="p-3 border-t flex justify-end">
                                <Button 
                                    size="sm" 
                                    onClick={handleApplyDateRange}
                                    disabled={!dateRange.from || !dateRange.to}
                                >
                                    Apply Range
                                </Button>
                            </div>
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
                </div>
            </div>

            <div className="hidden print:block text-center pb-4 border-b">
                <h2 className="text-2xl font-bold">Profit & Loss Statement</h2>
                <p className="text-muted-foreground mt-1">
                    For the period {formatDate(dateRange.from)} to {dateRange.to ? formatDate(dateRange.to) : 'Present'}
                </p>
            </div>

            {isPending ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Refreshing profit & loss report...</p>
                    </div>
                </div>
            ) : initialData ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
                        {[
                            { label: "Total Revenue", value: initialData.revenue.total },
                            { label: "Gross Profit", value: initialData.grossProfit },
                            { label: "Total Expenses", value: initialData.operatingExpenses.total },
                            { label: "Net Profit", value: initialData.netProfit, highlight: true },
                        ].map((item) => (
                            <Card key={item.label} className={item.highlight ? "border-primary/50 bg-primary/5" : ""}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={cn(
                                        "text-2xl font-bold",
                                        item.highlight && (item.value >= 0 ? "text-green-600" : "text-red-600")
                                    )}>
                                        {formatCurrency(item.value)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardHeader className="print:hidden">
                            <CardTitle>Income Statement</CardTitle>
                            <CardDescription>
                                {formatDate(dateRange.from)} to {dateRange.to ? formatDate(dateRange.to) : 'Present'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-bold pl-6">Account</TableHead>
                                        <TableHead className="text-right font-bold pr-6">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="bg-muted/20">
                                        <TableCell className="font-semibold pl-6">Revenue</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    {initialData.revenue.items.length > 0 ? initialData.revenue.items.map((item) => (
                                        <TableRow key={item.accountId}>
                                            <TableCell className="pl-10">{item.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(item.balance)}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell className="pl-10 text-muted-foreground italic">No revenue data</TableCell>
                                            <TableCell className="text-right font-mono pr-6">$0.00</TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow className="bg-muted/10 font-medium">
                                        <TableCell className="pl-6 pt-4">Total Revenue</TableCell>
                                        <TableCell className="text-right font-mono font-bold pt-4 pr-6">
                                            {formatCurrency(initialData.revenue.total)}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow className="bg-muted/20">
                                        <TableCell className="font-semibold pl-6 pt-6">Cost of Goods Sold</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    {initialData.costOfGoodsSold.items.length > 0 ? initialData.costOfGoodsSold.items.map((item) => (
                                        <TableRow key={item.accountId}>
                                            <TableCell className="pl-10">{item.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(item.balance)}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell className="pl-10 text-muted-foreground italic">No COGS data</TableCell>
                                            <TableCell className="text-right font-mono pr-6">$0.00</TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow className="bg-muted/10 font-medium border-b-2">
                                        <TableCell className="pl-6 pt-4">Total Cost of Goods Sold</TableCell>
                                        <TableCell className="text-right font-mono font-bold pt-4 pr-6">
                                            {formatCurrency(initialData.costOfGoodsSold.total)}
                                        </TableCell>
                                    </TableRow>
                                    
                                    <TableRow className="bg-primary/5 font-bold text-lg">
                                        <TableCell className="pl-6 py-4">Gross Profit</TableCell>
                                        <TableCell className="text-right font-mono py-4 pr-6">
                                            {formatCurrency(initialData.grossProfit)}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow className="bg-muted/20">
                                        <TableCell className="font-semibold pl-6 pt-6">Operating Expenses</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    {initialData.operatingExpenses.items.length > 0 ? initialData.operatingExpenses.items.map((item) => (
                                        <TableRow key={item.accountId}>
                                            <TableCell className="pl-10">{item.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(item.balance)}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell className="pl-10 text-muted-foreground italic">No expenses data</TableCell>
                                            <TableCell className="text-right font-mono pr-6">$0.00</TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow className="bg-muted/10 font-medium text-red-600 dark:text-red-400">
                                        <TableCell className="pl-6 pt-4">Total Operating Expenses</TableCell>
                                        <TableCell className="text-right font-mono font-bold pt-4 pr-6">
                                            ({formatCurrency(initialData.operatingExpenses.total)})
                                        </TableCell>
                                    </TableRow>

                                    {(initialData.otherIncome > 0 || initialData.otherExpenses > 0) && (
                                        <>
                                            <TableRow className="bg-muted/20">
                                                <TableCell className="font-semibold pl-6 pt-6">Other Income / (Expenses)</TableCell>
                                                <TableCell />
                                            </TableRow>
                                            {initialData.otherIncome > 0 && (
                                                <TableRow>
                                                    <TableCell className="pl-10">Other Income</TableCell>
                                                    <TableCell className="text-right font-mono pr-6">{formatCurrency(initialData.otherIncome)}</TableCell>
                                                </TableRow>
                                            )}
                                            {initialData.otherExpenses > 0 && (
                                                <TableRow>
                                                    <TableCell className="pl-10">Other Expenses</TableCell>
                                                    <TableCell className="text-right font-mono pr-6 text-red-600 dark:text-red-400">
                                                        ({formatCurrency(initialData.otherExpenses)})
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className={cn(
                                        "font-bold text-xl border-t-4",
                                        initialData.netProfit >= 0 ? "bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-100 dark:border-green-800" : "bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-100 dark:border-red-800"
                                    )}>
                                        <TableCell className="pl-6 py-6">Net Profit (Loss)</TableCell>
                                        <TableCell className="text-right font-mono py-6 pr-6">
                                            {formatCurrency(initialData.netProfit)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
                        <p>Generated on {formatDate(new Date())} at {format(new Date(), "p")}</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-muted-foreground mb-2">No data available</p>
                    <p className="text-sm text-muted-foreground">Please check your date selection</p>
                </div>
            )}
        </div>
  );
}
