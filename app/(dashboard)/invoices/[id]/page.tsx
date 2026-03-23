"use client";

import { useParams, useRouter } from "next/navigation";
import { useInvoice } from "@/hooks/use-invoices";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Pencil,
  Send,
  CheckCircle,
  Printer,
  Download,
  Mail,
} from "lucide-react";
import { Invoice } from "@/lib/types";
import { toast } from "sonner";

// Mock company settings
const COMPANY_INFO = {
  name: "FinPal Systems Ltd",
  email: "info@finpalsystems.co.ke",
  phone: "+254 712 345 678",
  address: "Westlands Square, 5th Floor",
  city: "Nairobi",
  country: "Kenya",
  pin: "A012345678Z",
  website: "www.finpalsystems.co.ke",
};

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);

  const getStatusBadge = (status: Invoice["status"]) => {
    const variants = {
      draft: { variant: "secondary" as const, className: "bg-gray-100 text-gray-800" },
      sent: { variant: "default" as const, className: "bg-blue-100 text-blue-800" },
      paid: { variant: "default" as const, className: "bg-green-100 text-green-800" },
      overdue: { variant: "destructive" as const, className: "bg-red-100 text-red-800" },
      cancelled: { variant: "secondary" as const, className: "bg-gray-100 text-gray-600" },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleEdit = () => {
    router.push(`/invoices/${invoiceId}/edit`);
  };

  const handleSend = () => {
    toast.success("Invoice sent to customer");
  };

  const handleMarkAsPaid = () => {
    toast.success("Invoice marked as paid");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.info("PDF download started");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-2">Invoice not found</p>
          <p className="text-sm text-muted-foreground mb-4">
            The invoice you are looking for does not exist
          </p>
          <Button onClick={() => router.push("/invoices")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with actions */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/invoices")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground">View and manage invoice details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          {invoice.status === "draft" && (
            <Button variant="outline" size="sm" onClick={handleSend}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          )}
          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <Button variant="outline" size="sm" onClick={handleMarkAsPaid}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Paid
            </Button>
          )}
          <Button size="sm" onClick={handleEdit}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <Card className="p-8 md:p-12">
        <CardContent className="p-0 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Company Info */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{COMPANY_INFO.name}</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{COMPANY_INFO.address}</p>
                <p>
                  {COMPANY_INFO.city}, {COMPANY_INFO.country}
                </p>
                <p>PIN: {COMPANY_INFO.pin}</p>
                <p>Email: {COMPANY_INFO.email}</p>
                <p>Phone: {COMPANY_INFO.phone}</p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="space-y-4 md:text-right">
              <div>
                <h3 className="text-3xl font-bold">INVOICE</h3>
                <p className="text-lg font-semibold text-muted-foreground">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between md:justify-end gap-8">
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <span className="font-medium">{formatDate(invoice.invoiceDate)}</span>
                </div>
                <div className="flex justify-between md:justify-end gap-8">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                </div>
                <div className="flex justify-between md:justify-end gap-8">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{getStatusBadge(invoice.status)}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bill To Section */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">BILL TO</h4>
            <div className="space-y-1">
              <p className="font-semibold text-lg">{invoice.customerName}</p>
              <p className="text-sm text-muted-foreground">{invoice.customerAddress}</p>
              <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lines.map((line, index) => (
                    <TableRow key={line.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{line.description}</TableCell>
                      <TableCell className="text-center">{line.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(line.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(line.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Notes */}
            {invoice.notes && (
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">NOTES</h4>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            )}

            {/* Calculation */}
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  VAT ({(invoice.vatRate * 100).toFixed(0)}%):
                </span>
                <span className="font-medium">{formatCurrency(invoice.vatAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>

              {invoice.amountPaid > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(invoice.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Amount Due:</span>
                    <span className="text-destructive">
                      {formatCurrency(invoice.amountDue)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Information */}
          {invoice.status !== "paid" && (
            <>
              <Separator />
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="text-sm font-semibold">Payment Information</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Payment due within 30 days</p>
                  <p>Bank: KCB Bank Kenya</p>
                  <p>Account Name: {COMPANY_INFO.name}</p>
                  <p>Account Number: 1234567890</p>
                  <p>M-Pesa Paybill: 123456</p>
                  <p>M-Pesa Till: 987654</p>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>Thank you for your business!</p>
            <p className="mt-1">{COMPANY_INFO.website}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment History (if applicable) */}
      {invoice.amountPaid > 0 && (
        <Card className="print:hidden">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment History</h3>
            <div className="text-sm">
              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="font-medium">Partial Payment</p>
                  <p className="text-muted-foreground">
                    {formatDate(new Date())}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatCurrency(invoice.amountPaid)}
                  </p>
                  <p className="text-xs text-muted-foreground">M-Pesa</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
