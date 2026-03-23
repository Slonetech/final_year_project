"use client";

import { useState } from "react";
import { useProfitLoss, useExportToPDF, usePrintReport } from "@/hooks/use-reports";
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

export default function ProfitLossPage() {
    const [startDate, setStartDate] = useState<Date>(startOfYear(new Date()));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const { data: pl, isLoading, error } = useProfitLoss(startDate, endDate);
    const { exportToPDF } = useExportToPDF();
    const { printReport } = usePrintReport();

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-destructive mb-2">Failed to load profit & loss report</p>
                    <p className="text-sm text-muted-foreground">Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profit & Loss</h1>
                    <p className="text-muted-foreground">Income statement for the selected period</p>
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
                    <Button onClick={() => exportToPDF("Profit & Loss")}>
                        <Download className="w-4 h-4 mr-2" />
                        Export to PDF
                    </Button>
                </div>
            </div>

            {/* Print header */}
            <div className="hidden print:block text-center pb-4 border-b">
                <h2 className="text-2xl font-bold">Profit & Loss Statement</h2>
                <p className="text-muted-foreground mt-1">
                    {formatDate(startDate)} – {formatDate(endDate)}
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading profit & loss data...</p>
                    </div>
                </div>
            ) : pl ? (
                <div className="space-y-4">
                    {/* Revenue */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue</CardTitle>
                            <CardDescription>Income earned from business operations</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableBody>
                                    {pl.revenue.items.map((item) => (
                                        <TableRow key={item.accountId}>
                                            <TableCell className="pl-6">{item.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(item.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="bg-muted font-bold">
                                        <TableCell className="pl-6">Total Revenue</TableCell>
                                        <TableCell className="text-right font-mono pr-6">{formatCurrency(pl.revenue.total)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* COGS */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cost of Goods Sold</CardTitle>
                            <CardDescription>Direct costs associated with producing goods/services</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableBody>
                                    {pl.costOfGoodsSold.items.map((item) => (
                                        <TableRow key={item.accountId}>
                                            <TableCell className="pl-6">{item.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(item.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="bg-muted font-bold">
                                        <TableCell className="pl-6">Total COGS</TableCell>
                                        <TableCell className="text-right font-mono pr-6">{formatCurrency(pl.costOfGoodsSold.total)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Gross Profit Banner */}
                    <Card className="border-2 border-primary/20">
                        <CardContent className="flex items-center justify-between py-4">
                            <span className="text-lg font-bold">Gross Profit</span>
                            <span className={cn("text-2xl font-bold", pl.grossProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                                {formatCurrency(pl.grossProfit)}
                            </span>
                        </CardContent>
                    </Card>

                    {/* Operating Expenses */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Operating Expenses</CardTitle>
                            <CardDescription>Costs of running the business</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableBody>
                                    {pl.operatingExpenses.items.map((item) => (
                                        <TableRow key={item.accountId}>
                                            <TableCell className="pl-6">{item.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(item.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="bg-muted font-bold">
                                        <TableCell className="pl-6">Total Operating Expenses</TableCell>
                                        <TableCell className="text-right font-mono pr-6">{formatCurrency(pl.operatingExpenses.total)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Net Profit Banner */}
                    <Card className={cn("border-2", pl.netProfit >= 0 ? "border-green-500/30" : "border-destructive/30")}>
                        <CardContent className="flex items-center justify-between py-4">
                            <span className="text-xl font-bold">Net Profit</span>
                            <span className={cn("text-3xl font-bold", pl.netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                                {formatCurrency(pl.netProfit)}
                            </span>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:mt-8">
                        {[
                            { label: "Total Revenue", value: pl.revenue.total },
                            { label: "Gross Profit", value: pl.grossProfit },
                            { label: "Net Profit", value: pl.netProfit },
                        ].map((item) => (
                            <Card key={item.label}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={cn("text-2xl font-bold", item.value >= 0 ? "" : "text-destructive")}>
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
