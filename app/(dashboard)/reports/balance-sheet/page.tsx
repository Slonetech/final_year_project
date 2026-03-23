"use client";

import { useState } from "react";
import { useBalanceSheet, useExportToPDF, usePrintReport } from "@/hooks/use-reports";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, Printer, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function BalanceSheetPage() {
    const [asOfDate, setAsOfDate] = useState<Date>(new Date());
    const { data: balanceSheet, isLoading, error } = useBalanceSheet(asOfDate);
    const { exportToPDF } = useExportToPDF();
    const { printReport } = usePrintReport();

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-destructive mb-2">Failed to load balance sheet</p>
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
                    <h1 className="text-3xl font-bold tracking-tight">Balance Sheet</h1>
                    <p className="text-muted-foreground">Statement of financial position</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(asOfDate, "PPP")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={asOfDate}
                                onSelect={(date) => date && setAsOfDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" onClick={() => printReport()}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    <Button onClick={() => exportToPDF("Balance Sheet")}>
                        <Download className="w-4 h-4 mr-2" />
                        Export to PDF
                    </Button>
                </div>
            </div>

            {/* Print header */}
            <div className="hidden print:block text-center pb-4 border-b">
                <h2 className="text-2xl font-bold">Balance Sheet</h2>
                <p className="text-muted-foreground mt-1">As of {formatDate(asOfDate)}</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading balance sheet...</p>
                    </div>
                </div>
            ) : balanceSheet ? (
                <div className="space-y-4">
                    {/* Assets */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assets</CardTitle>
                            <CardDescription>Resources owned by the business</CardDescription>
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
                                        <TableCell className="font-semibold pl-6">Current Assets</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    {balanceSheet.assets.currentAssets.map((a) => (
                                        <TableRow key={a.accountId}>
                                            <TableCell className="pl-10">{a.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(a.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/20">
                                        <TableCell className="font-semibold pl-6">Fixed Assets</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    {balanceSheet.assets.fixedAssets.map((a) => (
                                        <TableRow key={a.accountId}>
                                            <TableCell className="pl-10">{a.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(a.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="bg-muted font-bold">
                                        <TableCell className="text-lg pl-6">Total Assets</TableCell>
                                        <TableCell className="text-right text-lg font-mono pr-6">
                                            {formatCurrency(balanceSheet.assets.totalAssets)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Liabilities */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Liabilities</CardTitle>
                            <CardDescription>Obligations owed by the business</CardDescription>
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
                                        <TableCell className="font-semibold pl-6">Current Liabilities</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    {balanceSheet.liabilities.currentLiabilities.map((a) => (
                                        <TableRow key={a.accountId}>
                                            <TableCell className="pl-10">{a.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(a.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/20">
                                        <TableCell className="font-semibold pl-6">Long-Term Liabilities</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    {balanceSheet.liabilities.longTermLiabilities.map((a) => (
                                        <TableRow key={a.accountId}>
                                            <TableCell className="pl-10">{a.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(a.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="bg-muted font-bold">
                                        <TableCell className="text-lg pl-6">Total Liabilities</TableCell>
                                        <TableCell className="text-right text-lg font-mono pr-6">
                                            {formatCurrency(balanceSheet.liabilities.totalLiabilities)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Equity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Equity</CardTitle>
                            <CardDescription>Owner&apos;s stake in the business</CardDescription>
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
                                    {balanceSheet.equity.equityAccounts.map((a) => (
                                        <TableRow key={a.accountId}>
                                            <TableCell className="pl-6">{a.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(a.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="bg-muted font-bold">
                                        <TableCell className="text-lg pl-6">Total Equity</TableCell>
                                        <TableCell className="text-right text-lg font-mono pr-6">
                                            {formatCurrency(balanceSheet.equity.totalEquity)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 print:mt-8">
                        {[
                            { label: "Total Assets", value: balanceSheet.assets.totalAssets },
                            { label: "Total Liabilities", value: balanceSheet.liabilities.totalLiabilities },
                            { label: "Total Equity", value: balanceSheet.equity.totalEquity },
                        ].map((item) => (
                            <Card key={item.label}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(item.value)}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Print footer */}
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
