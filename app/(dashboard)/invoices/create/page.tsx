"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { CreateInvoiceDto, InvoiceLine } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, ArrowLeft, Save, Send } from "lucide-react";
import { toast } from "sonner";

type InvoiceFormData = {
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  lines: {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes: string;
};

export default function CreateInvoicePage() {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "sent">("draft");

  const { data: customers, isLoading: loadingCustomers } = useCustomers();
  const { data: products, isLoading: loadingProducts } = useProducts();
  const createInvoice = useCreateInvoice();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    defaultValues: {
      customerId: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      lines: [{ productId: "", description: "", quantity: 1, unitPrice: 0 }],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const lines = watch("lines");

  // Calculate totals
  const subtotal = lines.reduce((sum, line) => {
    const lineTotal = (line.quantity || 0) * (line.unitPrice || 0);
    return sum + lineTotal;
  }, 0);

  const vatRate = 0.16; // 16% VAT
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  const handleProductSelect = (index: number, productId: string) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      setValue(`lines.${index}.productId`, productId);
      setValue(`lines.${index}.description`, product.name);
      setValue(`lines.${index}.unitPrice`, product.sellingPrice);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    if (!data.customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (data.lines.length === 0 || !data.lines[0].description) {
      toast.error("Please add at least one line item");
      return;
    }

    const customer = customers?.find((c) => c.id === data.customerId);
    if (!customer) {
      toast.error("Customer not found");
      return;
    }

    const invoiceLines: InvoiceLine[] = data.lines.map((line, index) => ({
      id: `line-${index + 1}`,
      productId: line.productId || undefined,
      description: line.description,
      quantity: Number(line.quantity),
      unitPrice: Number(line.unitPrice),
      total: Number(line.quantity) * Number(line.unitPrice),
    }));

    const invoiceData: CreateInvoiceDto = {
      customerId: data.customerId,
      customerName: customer.name,
      customerEmail: customer.email,
      customerAddress: `${customer.address}, ${customer.city}, ${customer.country}`,
      invoiceDate: new Date(data.invoiceDate),
      dueDate: new Date(data.dueDate),
      status: status,
      lines: invoiceLines,
      subtotal: subtotal,
      vatAmount: vatAmount,
      vatRate: vatRate,
      total: total,
      notes: data.notes || undefined,
      createdBy: "user-1", // Mock user
    };

    try {
      await createInvoice.mutateAsync(invoiceData);
      toast.success(`Invoice ${status === "draft" ? "saved as draft" : "sent"} successfully`);
      router.push("/invoices");
    } catch (error) {
      toast.error("Failed to create invoice");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/invoices")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
            <p className="text-muted-foreground">Create a new invoice for your customer</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer and Date Information */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Enter the basic invoice information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">
                  Customer <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedCustomer}
                  onValueChange={(value) => {
                    setSelectedCustomer(value);
                    setValue("customerId", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCustomers ? (
                      <SelectItem value="loading" disabled>
                        Loading customers...
                      </SelectItem>
                    ) : customers && customers.length > 0 ? (
                      customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No customers found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-sm text-destructive">{errors.customerId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  type="date"
                  {...register("invoiceDate", { required: "Invoice date is required" })}
                />
                {errors.invoiceDate && (
                  <p className="text-sm text-destructive">{errors.invoiceDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  type="date"
                  {...register("dueDate", { required: "Due date is required" })}
                />
                {errors.dueDate && (
                  <p className="text-sm text-destructive">{errors.dueDate.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Add products or services to this invoice</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ productId: "", description: "", quantity: 1, unitPrice: 0 })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Line
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-12 md:col-span-4">
                      <Label htmlFor={`lines.${index}.productId`}>Product (Optional)</Label>
                      <Select
                        value={lines[index]?.productId || "custom"}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            setValue(`lines.${index}.productId`, "");
                          } else {
                            handleProductSelect(index, value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom item</SelectItem>
                          {loadingProducts ? (
                            <SelectItem value="loading" disabled>
                              Loading products...
                            </SelectItem>
                          ) : products && products.length > 0 ? (
                            products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {formatCurrency(product.sellingPrice)}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No products found
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-12 md:col-span-4">
                      <Label htmlFor={`lines.${index}.description`}>
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        {...register(`lines.${index}.description`, {
                          required: "Description is required",
                        })}
                        placeholder="Item description"
                      />
                    </div>

                    <div className="col-span-5 md:col-span-1">
                      <Label htmlFor={`lines.${index}.quantity`}>Qty</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`lines.${index}.quantity`, {
                          required: "Quantity is required",
                          min: { value: 0.01, message: "Quantity must be greater than 0" },
                          valueAsNumber: true,
                        })}
                      />
                    </div>

                    <div className="col-span-5 md:col-span-2">
                      <Label htmlFor={`lines.${index}.unitPrice`}>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`lines.${index}.unitPrice`, {
                          required: "Unit price is required",
                          min: { value: 0, message: "Price must be 0 or greater" },
                          valueAsNumber: true,
                        })}
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <Label>Total</Label>
                      <div className="h-10 flex items-center font-medium">
                        {formatCurrency(
                          (lines[index]?.quantity || 0) * (lines[index]?.unitPrice || 0)
                        )}
                      </div>
                    </div>

                    {fields.length > 1 && (
                      <div className="col-span-12 md:col-span-auto flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {index < fields.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT (16%):</span>
                <span className="font-medium">{formatCurrency(vatAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                {...register("notes")}
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any additional notes or payment instructions..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/invoices")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="outline"
            onClick={() => setStatus("draft")}
            disabled={createInvoice.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            type="submit"
            onClick={() => setStatus("sent")}
            disabled={createInvoice.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            Send Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
