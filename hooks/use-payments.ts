import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockPaymentsApi } from "@/lib/api/mock-api";
import { CreatePaymentDto } from "@/lib/types";
import { toast } from "sonner";

export function usePayments(filters?: { type?: string; customerId?: string; supplierId?: string }) {
  return useQuery({
    queryKey: ["payments", filters],
    queryFn: () => mockPaymentsApi.getAll(filters),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => mockPaymentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentDto) => mockPaymentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment recorded successfully");
    },
    onError: () => {
      toast.error("Failed to record payment");
    },
  });
}
