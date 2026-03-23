"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockSalesOrdersApi } from "@/lib/api/mock-api";
import { SalesOrder } from "@/lib/types";
import { toast } from "sonner";

interface SalesOrderFilters {
    query?: string;
    status?: string;
    customerId?: string;
}

export function useSalesOrders(filters?: SalesOrderFilters) {
    return useQuery({
        queryKey: ["sales-orders", filters],
        queryFn: () => mockSalesOrdersApi.getAll(filters),
    });
}

export function useSalesOrder(id: string) {
    return useQuery({
        queryKey: ["sales-orders", id],
        queryFn: () => mockSalesOrdersApi.getById(id),
        enabled: !!id,
    });
}

export function useUpdateSalesOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<SalesOrder> }) =>
            mockSalesOrdersApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
            toast.success("Sales order updated successfully");
        },
        onError: () => {
            toast.error("Failed to update sales order");
        },
    });
}

export function useDeleteSalesOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => mockSalesOrdersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
            toast.success("Sales order deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete sales order");
        },
    });
}
