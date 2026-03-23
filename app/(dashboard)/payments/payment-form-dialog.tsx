"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreatePaymentDto, PaymentMethod, PaymentType } from "@/lib/types";
import { useCreatePayment } from "@/hooks/use-payments";
import { useCustomers } from "@/hooks/use-customers";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useInvoices } from "@/hooks/use-invoices";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { CreditCard } from "lucide-react";

const paymentSchema = z.object({
  type: z.enum(["received", "made"]),
  date: z.string().min(1, "Date is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum(["cash", "mpesa", "bank_transfer", "cheque"]),
  reference: z.string().min(1, "Reference is required"),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  invoiceId: z.string().optional(),
  notes: z.string().optional(),
  // M-Pesa specific fields
  mpesaTransactionCode: z.string().optional(),
  mpesaPhoneNumber: z.string().optional(),
}).refine(
  (data) => {
    // If payment type is "received", customerId is required
    if (data.type === "received" && !data.customerId) {
      return false;
    }
    // If payment type is "made", supplierId is required
    if (data.type === "made" && !data.supplierId) {
      return false;
    }
    return true;
  },
  {
    message: "Customer or Supplier is required based on payment type",
    path: ["customerId"],
  }
).refine(
  (data) => {
    // If method is M-Pesa, require M-Pesa fields
    if (data.method === "mpesa") {
      return !!data.mpesaTransactionCode && !!data.mpesaPhoneNumber;
    }
    return true;
  },
  {
    message: "M-Pesa transaction code and phone number are required for M-Pesa payments",
    path: ["mpesaTransactionCode"],
  }
);

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentFormDialog({
  open,
  onOpenChange,
}: PaymentFormDialogProps) {
  const createPayment = useCreatePayment();
  const [selectedType, setSelectedType] = useState<PaymentType>("received");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash");

  // Fetch customers and suppliers
  const { data: customers } = useCustomers({ status: "active" });
  const { data: suppliers } = useSuppliers({ status: "active" });

  // Fetch invoices based on selected customer (for linking payments)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();
  const { data: invoices } = useInvoices({
    customerId: selectedType === "received" ? selectedCustomerId : undefined,
  });

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      type: "received",
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      method: "cash",
      reference: "",
      customerId: "",
      supplierId: "",
      invoiceId: "",
      notes: "",
      mpesaTransactionCode: "",
      mpesaPhoneNumber: "",
    },
  });

  // Watch for changes in payment type and method
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "type") {
        setSelectedType(value.type as PaymentType);
        // Clear customer/supplier when type changes
        form.setValue("customerId", "");
        form.setValue("supplierId", "");
        form.setValue("invoiceId", "");
      }
      if (name === "method") {
        setSelectedMethod(value.method as PaymentMethod);
        // Clear M-Pesa fields if method is not M-Pesa
        if (value.method !== "mpesa") {
          form.setValue("mpesaTransactionCode", "");
          form.setValue("mpesaPhoneNumber", "");
        }
      }
      if (name === "customerId") {
        setSelectedCustomerId(value.customerId);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      // Find customer or supplier name
      let customerName: string | undefined;
      let supplierName: string | undefined;

      if (data.type === "received" && data.customerId) {
        const customer = customers?.find((c) => c.id === data.customerId);
        customerName = customer?.name;
      } else if (data.type === "made" && data.supplierId) {
        const supplier = suppliers?.find((s) => s.id === data.supplierId);
        supplierName = supplier?.name;
      }

      const paymentData: CreatePaymentDto = {
        type: data.type,
        date: new Date(data.date),
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        customerId: data.type === "received" ? data.customerId : undefined,
        customerName: data.type === "received" ? customerName : undefined,
        supplierId: data.type === "made" ? data.supplierId : undefined,
        supplierName: data.type === "made" ? supplierName : undefined,
        invoiceId: data.invoiceId || undefined,
        notes: data.notes || undefined,
        createdBy: "current-user", // In real app, get from auth context
      };

      await createPayment.mutateAsync(paymentData);

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isSubmitting = createPayment.isPending;

  // Get the customer/supplier name for display
  const getEntityName = () => {
    if (selectedType === "received" && form.watch("customerId")) {
      const customer = customers?.find((c) => c.id === form.watch("customerId"));
      return customer?.name;
    } else if (selectedType === "made" && form.watch("supplierId")) {
      const supplier = suppliers?.find((s) => s.id === form.watch("supplierId"));
      return supplier?.name;
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment received from a customer or made to a supplier
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Payment Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="received">Received from Customer</SelectItem>
                        <SelectItem value="made">Made to Supplier</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* M-Pesa Fields */}
              {selectedMethod === "mpesa" && (
                <>
                  <FormField
                    control={form.control}
                    name="mpesaTransactionCode"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>M-Pesa Transaction Code *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="QXXXYYYZZZ"
                              {...field}
                              className="pl-10"
                              maxLength={10}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter the M-Pesa transaction code (e.g., QA12B34C56)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mpesaPhoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>M-Pesa Phone Number *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+254 712 345 678"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Paybill Number</FormLabel>
                    <FormControl>
                      <Input value="123456" disabled />
                    </FormControl>
                    <FormDescription>
                      Your company M-Pesa Paybill number
                    </FormDescription>
                  </FormItem>
                </>
              )}

              {/* Customer/Supplier Selector */}
              {selectedType === "received" ? (
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem className={selectedMethod === "mpesa" ? "" : "col-span-2"}>
                      <FormLabel>Customer *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem className={selectedMethod === "mpesa" ? "" : "col-span-2"}>
                      <FormLabel>Supplier *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers?.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Invoice Selector (Optional) */}
              {selectedType === "received" && selectedCustomerId && (
                <FormField
                  control={form.control}
                  name="invoiceId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Link to Invoice (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select invoice (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {invoices?.map((invoice) => (
                            <SelectItem key={invoice.id} value={invoice.id}>
                              {invoice.invoiceNumber} - {formatCurrency(invoice.amountDue)} due
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Reference */}
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Reference *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          selectedMethod === "mpesa"
                            ? "M-Pesa transaction code"
                            : selectedMethod === "cheque"
                            ? "Cheque number"
                            : "Payment reference"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedMethod === "mpesa"
                        ? "The M-Pesa transaction code will be used as reference"
                        : selectedMethod === "bank_transfer"
                        ? "Bank transaction reference number"
                        : selectedMethod === "cheque"
                        ? "Cheque number"
                        : "Payment reference number"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this payment..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Summary */}
            {form.watch("amount") > 0 && getEntityName() && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Payment Summary:</p>
                <div className="text-sm space-y-1">
                  <p>
                    {selectedType === "received" ? "Receiving" : "Paying"}{" "}
                    <span className="font-semibold">{formatCurrency(form.watch("amount"))}</span>
                  </p>
                  <p>
                    {selectedType === "received" ? "From:" : "To:"}{" "}
                    <span className="font-semibold">{getEntityName()}</span>
                  </p>
                  <p>
                    Method:{" "}
                    <span className="font-semibold capitalize">
                      {selectedMethod === "mpesa" ? "M-Pesa" : selectedMethod.replace("_", " ")}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Recording...
                  </>
                ) : (
                  "Record Payment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
