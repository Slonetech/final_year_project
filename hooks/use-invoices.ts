import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateInvoiceDto, Invoice } from "@/lib/types";
import { toast } from "sonner";
import { 
  getInvoicesAction, 
  getInvoiceAction, 
  createInvoiceAction, 
  updateInvoiceAction, 
  deleteInvoiceAction 
} from "@/app/(dashboard)/invoices/actions";

export function useInvoices(filters?: { status?: string; customerId?: string }) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => getInvoicesAction(filters?.status),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceAction(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceDto) => createInvoiceAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
      toast.success("Invoice created successfully");
    },
    onError: () => {
      toast.error("Failed to create invoice");
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
      updateInvoiceAction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
      toast.success("Invoice updated successfully");
    },
    onError: () => {
      toast.error("Failed to update invoice");
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInvoiceAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
      toast.success("Invoice deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete invoice");
    },
  });
}

