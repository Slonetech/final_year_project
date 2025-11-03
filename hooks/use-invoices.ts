import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockInvoicesApi } from "@/lib/api/mock-api";
import { CreateInvoiceDto } from "@/lib/types";
import { toast } from "sonner";

export function useInvoices(filters?: { status?: string; customerId?: string }) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => mockInvoicesApi.getAll(filters),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => mockInvoicesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceDto) => mockInvoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created successfully");
    },
    onError: () => {
      toast.error("Failed to create invoice");
    },
  });
}
