"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePayHeroInitiatePayment, usePayHeroPaymentStatus } from "@/hooks/use-payhero";
import { useCustomers } from "@/hooks/use-customers";
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
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Smartphone } from "lucide-react";
import { PaymentStatusBadge } from "@/components/dashboard/payment-status-badge";

const payHeroSchema = z.object({
    amount: z.number().min(1, "Amount must be at least KES 1"),
    phone_number: z
        .string()
        .regex(/^(254|0)[17]\d{8}$/, "Invalid Kenyan phone number (e.g., 0712345678 or 254712345678)"),
    provider: z.enum(["m-pesa", "card"]),
    customerId: z.string().min(1, "Customer is required"),
    invoiceId: z.string().optional(),
});

type PayHeroFormData = z.infer<typeof payHeroSchema>;

interface PayHeroPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PayHeroPaymentDialog({ open, onOpenChange }: PayHeroPaymentDialogProps) {
    const [transactionReference, setTransactionReference] = useState<string | undefined>();
    const initiatePayment = usePayHeroInitiatePayment();
    const { data: customers } = useCustomers({ status: "active" });

    // Poll for payment status if we have a transaction reference
    const { data: paymentStatus } = usePayHeroPaymentStatus(transactionReference);

    const form = useForm<PayHeroFormData>({
        resolver: zodResolver(payHeroSchema),
        defaultValues: {
            amount: 0,
            phone_number: "",
            provider: "m-pesa",
            customerId: "",
            invoiceId: undefined,
        },
    });

    const onSubmit = async (data: PayHeroFormData) => {
        try {
            const result = await initiatePayment.mutateAsync({
                amount: data.amount,
                phone_number: data.phone_number,
                channel_id: data.provider === "m-pesa" ? 1 : 2,
                provider: data.provider,
                external_reference: `INV-${Date.now()}`, // Generate unique reference
            });

            if (result.success && result.transaction_reference) {
                setTransactionReference(result.transaction_reference);
            }
        } catch (error) {
            console.error("Payment error:", error);
        }
    };

    const handleClose = () => {
        form.reset();
        setTransactionReference(undefined);
        onOpenChange(false);
    };

    const isProcessing =
        paymentStatus?.data?.status === "pending" ||
        paymentStatus?.data?.status === "processing";

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>PayHero Payment</DialogTitle>
                    <DialogDescription>
                        Initiate M-Pesa or Card payment via PayHero gateway
                    </DialogDescription>
                </DialogHeader>

                {transactionReference && paymentStatus ? (
                    // Show payment status
                    <div className="space-y-4 py-4">
                        <div className="text-center space-y-4">
                            <PaymentStatusBadge
                                status={paymentStatus.data.status}
                                showIcon={true}
                            />

                            <div className="space-y-2">
                                <p className="text-2xl font-bold">
                                    {formatCurrency(paymentStatus.data.amount)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Payment to {paymentStatus.data.phone_number}
                                </p>
                                <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                    {paymentStatus.data.transaction_reference}
                                </p>
                            </div>

                            {isProcessing && (
                                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg space-y-2">
                                    <p className="font-medium">Waiting for payment confirmation...</p>
                                    <p className="text-sm">
                                        Check your phone for the M-Pesa prompt and enter your PIN
                                    </p>
                                </div>
                            )}

                            {paymentStatus.data.status === "success" && (
                                <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                                    <p className="font-medium">Payment successful!</p>
                                    <p className="text-sm">Transaction completed successfully</p>
                                </div>
                            )}

                            {paymentStatus.data.status === "failed" && (
                                <div className="bg-red-50 text-red-800 p-4 rounded-lg">
                                    <p className="font-medium">Payment failed</p>
                                    <p className="text-sm">Please try again or use a different payment method</p>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">
                                {isProcessing ? "Close (Keep waiting)" : "Done"}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    // Show payment form
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="customerId"
                                render={({ field }) => (
                                    <FormItem>
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

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount (KES) *</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="provider"
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
                                                <SelectItem value="m-pesa">
                                                    <div className="flex items-center gap-2">
                                                        <Smartphone className="w-4 h-4" />
                                                        M-Pesa
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="card">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4" />
                                                        Credit/Debit Card
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="0712345678 or 254712345678"
                                                    {...field}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Kenyan phone number for M-Pesa/Card payment
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {form.watch("amount") > 0 && (
                                <div className="bg-muted/50 p-4 rounded-lg border">
                                    <p className="text-sm font-medium mb-2">Payment Summary</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {formatCurrency(form.watch("amount"))}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        via {form.watch("provider") === "m-pesa" ? "M-Pesa" : "Card"}
                                    </p>
                                </div>
                            )}

                            <DialogFooter className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={initiatePayment.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={initiatePayment.isPending}>
                                    {initiatePayment.isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Initiating...
                                        </>
                                    ) : (
                                        "Initiate Payment"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
