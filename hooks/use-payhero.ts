import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
    PayHeroInitiatePaymentRequest,
    PayHeroInitiatePaymentResponse,
    PayHeroPaymentStatusResponse,
    PayHeroTransactionListResponse,
} from "@/lib/services/payhero/types";

/**
 * Hook to initiate a PayHero payment
 */
export function usePayHeroInitiatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<PayHeroInitiatePaymentRequest, "callback_url">) => {
            const response = await fetch("/api/payments/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Payment initiation failed");
            }

            return response.json() as Promise<PayHeroInitiatePaymentResponse>;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["payhero", "transactions"] });

            if (data.success) {
                toast.success("Payment initiated successfully! Check your phone for M-Pesa prompt.");
            } else {
                toast.error(data.message || "Payment initiation failed");
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to initiate payment");
        },
    });
}

/**
 * Hook to check PayHero payment status
 */
export function usePayHeroPaymentStatus(transactionReference?: string) {
    return useQuery({
        queryKey: ["payhero", "status", transactionReference],
        queryFn: async () => {
            if (!transactionReference) throw new Error("Transaction reference required");

            const response = await fetch(`/api/payments/${transactionReference}/status`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to get payment status");
            }

            return response.json() as Promise<PayHeroPaymentStatusResponse>;
        },
        enabled: !!transactionReference,
        refetchInterval: (query) => {
            // Auto-refresh every 3 seconds if payment is still pending/processing
            const status = query.state.data?.data?.status;
            if (status === "pending" || status === "processing") {
                return 3000;
            }
            return false;
        },
    });
}

/**
 * Hook to list PayHero transactions
 */
export function usePayHeroTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
}) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.status) queryParams.set("status", params.status);
    if (params?.startDate) queryParams.set("startDate", params.startDate);
    if (params?.endDate) queryParams.set("endDate", params.endDate);

    return useQuery({
        queryKey: ["payhero", "transactions", params],
        queryFn: async () => {
            const response = await fetch(`/api/payments/history?${queryParams.toString()}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to fetch transactions");
            }

            return response.json() as Promise<PayHeroTransactionListResponse>;
        },
    });
}
