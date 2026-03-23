"use client";

import { useState } from "react";
import { useCashFlow, useExportToPDF, usePrintReport } from "@/hooks/use-reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Download, Printer, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfYear } from "date-fns";

export default function CashFlowPage() {
    const [startDate, setStartDate] = useState<Date>(startOfYear(new Date()));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const { data: cashFlow, isLoading, error } = useCashFlow(startDate, endDate);
    const { exportToPDF } = useExportToPDF();
    const { printReport } = usePrintReport();

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-destructive mb-2">Failed to load cash flow statement</p>
                    <p className="text-sm text-muted-foreground">Please try again later</p>
                </div>
            </div>
        );
    }

    const sections = cashFlow
        ? [
            {
                key: "operating",
                title: "Operating Activities",
                description: "Cash flows from day-to-day business operations",
                items: cashFlow.operatingActivities.items,
                total: cashFlow.operatingActivities.total,
            },
            {
                key: "investing",
                title: "Investing Activities",
                description: "Cash flows from asset purchases and disposals",
                items: cashFlow.investingActivities.items,
                total: cashFlow.investingActivities.total,
            },
            {
                key: "financing",
                title: "Financing Activities",
                description: "Cash flows from loans, equity, and owner transactions",
                items: cashFlow.financingActivities.items,
                total: cashFlow.financingActivities.total,
            },
        ]
        : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cash Flow</h1>
                    <p className="text-muted-foreground">Statement of cash flows for the selected period</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                From: {format(startDate, "PPP")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                To: {format(endDate, "PPP")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" onClick={() => printReport()}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    <Button onClick={() => exportToPDF("Cash Flow Statement")}>
                        <Download className="w-4 h-4 mr-2" />
                        Export to PDF
                    </Button>
                </div>
            </div>

            {/* Print header */}
            <div className="hidden print:block text-center pb-4 border-b">
                <h2 className="text-2xl font-bold">Cash Flow Statement</h2>
                <p className="text-muted-foreground mt-1">
                    {formatDate(startDate)} – {formatDate(endDate)}
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading cash flow data...</p>
                    </div>
                </div>
            ) : cashFlow ? (
                <div className="space-y-4">
                    {/* Activity Sections */}
                    {sections.map((section) => (
                        <Card key={section.key}>
                            <CardHeader>
                                <CardTitle>{section.title}</CardTitle>
                                <CardDescription>{section.description}</CardDescription>
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
                                        {section.items.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="pl-6">{item.description}</TableCell>
                                                <TableCell
                                                    className={cn(
                                                        "text-right font-mono pr-6",
                                                        item.amount < 0 ? "text-destructive" : "text-green-600 dark:text-green-400"
                                                    )}
                                                >
                                                    {item.amount < 0 ? `(${formatCurrency(Math.abs(item.amount))})` : formatCurrency(item.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow className="bg-muted font-bold">
                                            <TableCell className="pl-6">Net {section.title}</TableCell>
                                            <TableCell
                                                className={cn(
                                                    "text-right font-mono pr-6",
                                                    section.total < 0 ? "text-destructive" : "text-green-600 dark:text-green-400"
                                                )}
                                            >
                                                {section.total < 0 ? `(${formatCurrency(Math.abs(section.total))})` : formatCurrency(section.total)}
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Net Cash Flow Banner */}
                    <Card className={cn("border-2", cashFlow.netCashFlow >= 0 ? "border-green-500/30" : "border-destructive/30")}>
                        <CardContent className="flex items-center justify-between py-4">
                            <span className="text-xl font-bold">Net Increase / (Decrease) in Cash</span>
                            <span className={cn("text-3xl font-bold", cashFlow.netCashFlow >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                                {cashFlow.netCashFlow < 0
                                    ? `(${formatCurrency(Math.abs(cashFlow.netCashFlow))})`
                                    : formatCurrency(cashFlow.netCashFlow)}
                            </span>
                        </CardContent>
                    </Card>

                    {/* Opening / Closing Balances */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: "Opening Cash Balance", value: cashFlow.openingBalance },
                            { label: "Net Cash Flow", value: cashFlow.netCashFlow },
                            { label: "Closing Cash Balance", value: cashFlow.closingBalance },
                        ].map((item) => (
                            <Card key={item.label}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={cn("text-2xl font-bold", item.value < 0 ? "text-destructive" : "")}>
                                        {formatCurrency(item.value)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
                        <p>Generated on {formatDate(new Date())} at {format(new Date(), "p")}</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-muted-foreground mb-2">No data available</p>
                    <p className="text-sm text-muted-foreground">Please check your date range selection</p>
                </div>
            )}
        </div>
    );
}
