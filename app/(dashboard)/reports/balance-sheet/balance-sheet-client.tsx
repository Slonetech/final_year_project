"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BalanceSheetData } from "@/lib/types";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, Printer, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function BalanceSheetClient({
  initialData,
  asOfDate: initialDate,
}: {
  initialData: BalanceSheetData;
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
  const handleExport = () => toast.success("Exporting to PDF feature comming soon...");

  return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Balance Sheet</h1>
                    <p className="text-muted-foreground">Statement of financial position</p>
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
                    <Button onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export to PDF
                    </Button>
                </div>
            </div>

            <div className="hidden print:block text-center pb-4 border-b">
                <h2 className="text-2xl font-bold">Balance Sheet</h2>
                <p className="text-muted-foreground mt-1">As of {formatDate(date)}</p>
            </div>

            {isPending ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Refreshing balance sheet...</p>
                    </div>
                </div>
            ) : initialData ? (
                <div className="space-y-4">
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
                                    {initialData.assets.currentAssets.map((a) => (
                                        <TableRow key={a.accountId}>
                                            <TableCell className="pl-10">{a.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(a.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/20">
                                        <TableCell className="font-semibold pl-6">Fixed Assets</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    {initialData.assets.fixedAssets.map((a) => (
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
                                            {formatCurrency(initialData.assets.totalAssets)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>

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
                                    {initialData.liabilities.currentLiabilities.map((a) => (
                                        <TableRow key={a.accountId}>
                                            <TableCell className="pl-10">{a.accountName}</TableCell>
                                            <TableCell className="text-right font-mono pr-6">{formatCurrency(a.balance)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/20">
                                        <TableCell className="font-semibold pl-6">Long-Term Liabilities</TableCell>
                                        <TableCell />
                                    </TableRow>
                                    {initialData.liabilities.longTermLiabilities.map((a) => (
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
                                            {formatCurrency(initialData.liabilities.totalLiabilities)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>

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
                                    {initialData.equity.equityAccounts.map((a) => (
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
                                            {formatCurrency(initialData.equity.totalEquity)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 print:mt-8">
                        {[
                            { label: "Total Assets", value: initialData.assets.totalAssets },
                            { label: "Total Liabilities", value: initialData.liabilities.totalLiabilities },
                            { label: "Total Equity", value: initialData.equity.totalEquity },
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
