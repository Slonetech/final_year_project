"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Payment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, ArrowDownRight, ArrowUpRight, CreditCard, Banknote, Building2, FileText } from "lucide-react";
import { PaymentFormDialog } from "./payment-form-dialog";


export default function PaymentsClient({ 
  initialPayments, 
  customers,
  suppliers = [],
  type 
}: { 
  initialPayments: Payment[];
  customers: any[];
  suppliers: any[];
  type: string; 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(type);
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleTypeChange = (val: string) => {
    setTypeFilter(val);
    startTransition(() => {
        const params = new URLSearchParams();
        if (val && val !== "all") params.set("type", val);
        router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Filter payments by search query and method
  const filteredPayments = initialPayments.filter((payment) => {
    const matchesSearch =
      !searchQuery ||
      payment.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.supplierName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  // Calculate totals
  const totalReceived = initialPayments
    .filter((p) => p.type === "received")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalMade = initialPayments
    .filter((p) => p.type === "made")
    .reduce((sum, p) => sum + p.amount, 0);

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="w-4 h-4" />;
      case "mpesa":
        return <CreditCard className="w-4 h-4" />;
      case "bank_transfer":
        return <Building2 className="w-4 h-4" />;
      case "cheque":
        return <FileText className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Cash";
      case "mpesa":
        return "M-Pesa";
      case "bank_transfer":
        return "Bank Transfer";
      case "cheque":
        return "Cheque";
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track all payments received and made</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</div>
            <p className="text-xs text-muted-foreground">
              {initialPayments.filter((p) => p.type === "received").length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Made</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalMade)}</div>
            <p className="text-xs text-muted-foreground">
              {initialPayments.filter((p) => p.type === "made").length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReceived - totalMade >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(totalReceived - totalMade)}
            </div>
            <p className="text-xs text-muted-foreground">
              {initialPayments.length} total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>
            A comprehensive list of all payments in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="made">Made</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isPending ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Refreshing payments...</p>
              </div>
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Customer/Supplier</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.type === "received" ? "default" : "secondary"}
                          className={
                            payment.type === "received"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }
                        >
                          {payment.type === "received" ? (
                            <>
                              <ArrowDownRight className="w-3 h-3 mr-1" />
                              Received
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                              Made
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.type === "received" ? payment.customerName : payment.supplierName}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${payment.type === "received" ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {payment.type === "received" ? "+" : "-"}
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.method)}
                          <span className="text-sm">{getPaymentMethodLabel(payment.method)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {payment.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground mb-2">No payments found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || typeFilter !== "all" || methodFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by recording your first payment"}
              </p>
              {!searchQuery && typeFilter === "all" && methodFilter === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Payment Dialog */}
      <PaymentFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        customers={customers}
        suppliers={suppliers}
      />
    </div>
  );
}
