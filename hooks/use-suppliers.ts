import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockSuppliersApi } from "@/lib/api/mock-api";
import { CreateSupplierDto, UpdateSupplierDto } from "@/lib/types";
import { toast } from "sonner";

export function useSuppliers(filters?: { query?: string; status?: string }) {
  return useQuery({
    queryKey: ["suppliers", filters],
    queryFn: () => mockSuppliersApi.getAll(filters),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => mockSuppliersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierDto) => mockSuppliersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier created successfully");
    },
    onError: () => {
      toast.error("Failed to create supplier");
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierDto }) =>
      mockSuppliersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["supplier", variables.id] });
      toast.success("Supplier updated successfully");
    },
    onError: () => {
      toast.error("Failed to update supplier");
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockSuppliersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete supplier");
    },
  });
}
