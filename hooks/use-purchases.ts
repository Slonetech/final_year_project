"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockPurchaseOrdersApi } from "@/lib/api/mock-api";
import { PurchaseOrder } from "@/lib/types";
import { toast } from "sonner";

interface PurchaseOrderFilters {
    query?: string;
    status?: string;
    supplierId?: string;
}

export function usePurchaseOrders(filters?: PurchaseOrderFilters) {
    return useQuery({
        queryKey: ["purchase-orders", filters],
        queryFn: () => mockPurchaseOrdersApi.getAll(filters),
    });
}

export function usePurchaseOrder(id: string) {
    return useQuery({
        queryKey: ["purchase-orders", id],
        queryFn: () => mockPurchaseOrdersApi.getById(id),
        enabled: !!id,
    });
}

export function useUpdatePurchaseOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<PurchaseOrder> }) =>
            mockPurchaseOrdersApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
            toast.success("Purchase order updated successfully");
        },
        onError: () => {
            toast.error("Failed to update purchase order");
        },
    });
}

export function useDeletePurchaseOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => mockPurchaseOrdersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
            toast.success("Purchase order deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete purchase order");
        },
    });
}
