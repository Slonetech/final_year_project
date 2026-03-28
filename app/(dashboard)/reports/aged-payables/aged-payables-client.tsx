"use client";

import { AgedPayablesData } from "@/lib/types";
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
import { exportToPDF } from "@/lib/utils/pdf-export";
import { exportAgedPayablesToExcel } from "@/lib/utils/excel-export";
import { Download, Printer, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { useMemo } from "react";
import { toast } from "sonner";

export default function AgedPayablesClient({ initialData }: { initialData: AgedPayablesData[] }) {
  const handlePrint = () => window.print();

  const handleExportPDF = async () => {
    try {
      await exportToPDF(
        "aged-payables-report",
        `aged-payables-${format(new Date(), "yyyy-MM-dd")}.pdf`,
        { orientation: "landscape" }
      );
      toast.success("Aged Payables report exported to PDF successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
      console.error(error);
    }
  };

  const handleExportExcel = () => {
    try {
      exportAgedPayablesToExcel(
        initialData,
        `aged-payables-${format(new Date(), "yyyy-MM-dd")}.xlsx`
      );
      toast.success("Aged Payables report exported to Excel successfully");
    } catch (error) {
      toast.error("Failed to export Excel");
      console.error(error);
    }
  };

  const totals = useMemo(() => {
    if (!initialData) return null;
    return initialData.reduce(
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
  }, [initialData]);

  const overduePercentage = useMemo(() => {
    if (!totals || totals.total === 0) return 0;
    const overdue = totals.days30 + totals.days60 + totals.days90 + totals.over90;
    return (overdue / totals.total) * 100;
  }, [totals]);

  return (
    <div id="aged-payables-report" className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aged Payables</h1>
          <p className="text-muted-foreground">Track outstanding supplier balances by age</p>
        </div>
        <div className="flex gap-2">
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

      {totals && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.total)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.current)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.days30 + totals.days60 + totals.days90 + totals.over90)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue %</CardTitle>
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

      <Card>
        <div className="hidden print:block px-6 pt-6 pb-4 border-b">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Aged Payables Report</h2>
            <p className="text-muted-foreground mt-1">As of {formatDate(new Date())}</p>
          </div>
        </div>

        <CardHeader className="print:hidden">
          <CardTitle>Aged Payables Report</CardTitle>
          <CardDescription>As of {formatDate(new Date())}</CardDescription>
        </CardHeader>

        <CardContent>
          {initialData && initialData.length > 0 ? (
             <div className="space-y-4">
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
                     {initialData.map((item) => (
                       <TableRow key={item.supplierId}>
                         <TableCell className="font-medium">{item.supplierName}</TableCell>
                         <TableCell className="text-right font-mono">
                           {item.current > 0 ? formatCurrency(item.current) : "-"}
                         </TableCell>
                         <TableCell className={cn("text-right font-mono", item.days30 > 0 && "text-yellow-600 dark:text-yellow-500 font-semibold")}>
                           {item.days30 > 0 ? formatCurrency(item.days30) : "-"}
                         </TableCell>
                         <TableCell className={cn("text-right font-mono", item.days60 > 0 && "text-orange-600 dark:text-orange-500 font-semibold")}>
                           {item.days60 > 0 ? formatCurrency(item.days60) : "-"}
                         </TableCell>
                         <TableCell className={cn("text-right font-mono", item.days90 > 0 && "text-red-600 dark:text-red-500 font-semibold")}>
                           {item.days90 > 0 ? formatCurrency(item.days90) : "-"}
                         </TableCell>
                         <TableCell className={cn("text-right font-mono", item.over90 > 0 && "text-red-700 dark:text-red-600 font-bold")}>
                           {item.over90 > 0 ? formatCurrency(item.over90) : "-"}
                         </TableCell>
                         <TableCell className="text-right font-mono font-semibold">
                           {formatCurrency(item.total)}
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                   {totals && (
                     <TableFooter>
                       <TableRow className="bg-muted font-bold">
                         <TableCell className="text-lg">Total</TableCell>
                         <TableCell className="text-right text-lg font-mono">{formatCurrency(totals.current)}</TableCell>
                         <TableCell className={cn("text-right text-lg font-mono", totals.days30 > 0 && "text-yellow-600 dark:text-yellow-500")}>
                           {formatCurrency(totals.days30)}
                         </TableCell>
                         <TableCell className={cn("text-right text-lg font-mono", totals.days60 > 0 && "text-orange-600 dark:text-orange-500")}>
                           {formatCurrency(totals.days60)}
                         </TableCell>
                         <TableCell className={cn("text-right text-lg font-mono", totals.days90 > 0 && "text-red-600 dark:text-red-500")}>
                           {formatCurrency(totals.days90)}
                         </TableCell>
                         <TableCell className={cn("text-right text-lg font-mono", totals.over90 > 0 && "text-red-700 dark:text-red-600")}>
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
 
               <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
                 <p>Generated on {formatDate(new Date())} at {format(new Date(), "p")}</p>
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-64 text-center">
               <p className="text-muted-foreground mb-2">No payables data available</p>
               <p className="text-sm text-muted-foreground">Outstanding supplier balances will appear here</p>
             </div>
           )}
        </CardContent>
      </Card>
      
      <Card className="print:hidden">
         <CardHeader>
           <CardTitle className="text-base">Understanding Aged Payables</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="space-y-2 text-sm text-muted-foreground">
             <p>
               The aged payables report shows the outstanding balances owed to suppliers, categorized by how long the invoices have been unpaid.
             </p>
             <p className="font-medium text-foreground">Color Coding:</p>
             <ul className="list-disc list-inside space-y-1 ml-2">
               <li>
                 <span className="text-yellow-600 dark:text-yellow-500 font-semibold">1-30 Days</span> - Recently overdue, low risk
               </li>
               <li>
                 <span className="text-orange-600 dark:text-orange-500 font-semibold">31-60 Days</span> - Moderate overdue, requires attention
               </li>
               <li>
                 <span className="text-red-600 dark:text-red-500 font-semibold">61-90 Days</span> - Significantly overdue, urgent follow-up needed
               </li>
               <li>
                 <span className="text-red-700 dark:text-red-600 font-bold">Over 90 Days</span> - Severely overdue, may require collection action
               </li>
             </ul>
           </div>
           <div className="pt-2 border-t">
             <p className="text-sm font-medium text-foreground mb-2">Best Practices:</p>
             <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-muted-foreground">
               <li>Review this report weekly to balance cash flows</li>
               <li>Prioritize payments that are significantly overdue</li>
               <li>Consider offering payment plans for large overdue amounts to your own suppliers</li>
             </ul>
           </div>
         </CardContent>
       </Card>
    </div>
  );
}
