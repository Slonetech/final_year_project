"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CashFlowData } from "@/lib/types";
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
import { exportCashFlowToExcel } from "@/lib/utils/excel-export";
import { Printer, Calendar as CalendarIcon, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function CashFlowClient({
  initialData,
  startDate: initialStart,
  endDate: initialEnd,
}: {
  initialData: CashFlowData;
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
      exportCashFlowToExcel(
        initialData,
        dateRange.from,
        dateRange.to || new Date(),
        `cash-flow-${format(dateRange.from, "yyyy-MM-dd")}-to-${dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "present"}.xlsx`
      );
      toast.success("Cash Flow report exported to Excel successfully");
    } catch (error) {
      toast.error("Failed to export Excel");
      console.error(error);
    }
  };

  return (
        <div id="cash-flow-report" className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Statement of Cash Flows</h1>
                    <p className="text-muted-foreground">Track cash inflows and outflows</p>
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
                <h2 className="text-2xl font-bold">Statement of Cash Flows</h2>
                <p className="text-muted-foreground mt-1">
                    For the period {formatDate(dateRange.from)} to {dateRange.to ? formatDate(dateRange.to) : 'Present'}
                </p>
            </div>

            {isPending ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Refreshing cash flow report...</p>
                    </div>
                </div>
            ) : initialData ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
                        {[
                            { label: "Operating Activities", value: initialData.operatingActivities.total },
                            { label: "Investing Activities", value: initialData.investingActivities.total },
                            { label: "Financing Activities", value: initialData.financingActivities.total },
                            { label: "Net Cash Flow", value: initialData.netCashFlow, highlight: true },
                            { label: "Opening Balance", value: initialData.openingBalance },
                            { label: "Closing Balance", value: initialData.closingBalance, highlight: true },
                        ].map((item) => (
                            <Card key={item.label} className={item.highlight ? "border-primary/50 bg-primary/5" : ""}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={cn(
                                        "text-2xl font-bold",
                                        item.highlight ? (item.value >= 0 ? "text-green-600" : "text-red-600") : ""
                                    )}>
                                        {formatCurrency(item.value)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardHeader className="print:hidden">
                            <CardTitle>Cash Flow Statement</CardTitle>
                            <CardDescription>
                                {formatDate(dateRange.from)} to {dateRange.to ? formatDate(dateRange.to) : 'Present'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-bold pl-6">Description</TableHead>
                                        <TableHead className="text-right font-bold pr-6">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="bg-muted/20">
                                        <TableCell className="font-semibold pl-6">Operating Activities</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    {initialData.operatingActivities.items.length > 0 ? initialData.operatingActivities.items.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="pl-10">{item.description}</TableCell>
                                            <TableCell className={cn("text-right font-mono pr-6", item.amount < 0 && "text-red-600 dark:text-red-400")}>
                                                {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount))})` : formatCurrency(item.amount)}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell className="pl-10 text-muted-foreground italic">No operating activities</TableCell>
                                            <TableCell className="text-right font-mono pr-6">$0.00</TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow className="bg-muted/10 font-medium">
                                        <TableCell className="pl-6 pt-4">Net Cash from Operating Activities</TableCell>
                                        <TableCell className={cn("text-right font-mono font-bold pt-4 pr-6", initialData.operatingActivities.total < 0 && "text-red-600 dark:text-red-400")}>
                                            {initialData.operatingActivities.total < 0 ? `(${formatCurrency(Math.abs(initialData.operatingActivities.total))})` : formatCurrency(initialData.operatingActivities.total)}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow className="bg-muted/20">
                                        <TableCell className="font-semibold pl-6 pt-6">Investing Activities</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    {initialData.investingActivities.items.length > 0 ? initialData.investingActivities.items.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="pl-10">{item.description}</TableCell>
                                            <TableCell className={cn("text-right font-mono pr-6", item.amount < 0 && "text-red-600 dark:text-red-400")}>
                                                {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount))})` : formatCurrency(item.amount)}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell className="pl-10 text-muted-foreground italic">No investing activities</TableCell>
                                            <TableCell className="text-right font-mono pr-6">$0.00</TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow className="bg-muted/10 font-medium border-b-2">
                                        <TableCell className="pl-6 pt-4">Net Cash from Investing Activities</TableCell>
                                        <TableCell className={cn("text-right font-mono font-bold pt-4 pr-6", initialData.investingActivities.total < 0 && "text-red-600 dark:text-red-400")}>
                                            {initialData.investingActivities.total < 0 ? `(${formatCurrency(Math.abs(initialData.investingActivities.total))})` : formatCurrency(initialData.investingActivities.total)}
                                        </TableCell>
                                    </TableRow>
                                    
                                    <TableRow className="bg-muted/20">
                                        <TableCell className="font-semibold pl-6 pt-6">Financing Activities</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    {initialData.financingActivities.items.length > 0 ? initialData.financingActivities.items.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="pl-10">{item.description}</TableCell>
                                            <TableCell className={cn("text-right font-mono pr-6", item.amount < 0 && "text-red-600 dark:text-red-400")}>
                                                {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount))})` : formatCurrency(item.amount)}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell className="pl-10 text-muted-foreground italic">No financing activities</TableCell>
                                            <TableCell className="text-right font-mono pr-6">$0.00</TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow className="bg-muted/10 font-medium border-b-2">
                                        <TableCell className="pl-6 pt-4">Net Cash from Financing Activities</TableCell>
                                        <TableCell className={cn("text-right font-mono font-bold pt-4 pr-6", initialData.financingActivities.total < 0 && "text-red-600 dark:text-red-400")}>
                                            {initialData.financingActivities.total < 0 ? `(${formatCurrency(Math.abs(initialData.financingActivities.total))})` : formatCurrency(initialData.financingActivities.total)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                                <TableFooter className="bg-transparent">
                                    <TableRow className="font-bold text-lg">
                                        <TableCell className="pl-6 pt-6">Net Increase (Decrease) in Cash</TableCell>
                                        <TableCell className={cn("text-right font-mono pt-6 pr-6", initialData.netCashFlow < 0 && "text-red-600 dark:text-red-400")}>
                                            {initialData.netCashFlow < 0 ? `(${formatCurrency(Math.abs(initialData.netCashFlow))})` : formatCurrency(initialData.netCashFlow)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="font-bold text-lg">
                                        <TableCell className="pl-6 py-2">Cash at Beginning of Period</TableCell>
                                        <TableCell className="text-right font-mono py-2 pr-6">
                                            {formatCurrency(initialData.openingBalance)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="font-bold text-xl bg-muted/30 border-t-2">
                                        <TableCell className="pl-6 py-4">Cash at End of Period</TableCell>
                                        <TableCell className="text-right font-mono py-4 pr-6 text-primary">
                                            {formatCurrency(initialData.closingBalance)}
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
