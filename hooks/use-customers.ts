import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateCustomerDto, UpdateCustomerDto } from "@/lib/types";
import { toast } from "sonner";
import { 
  getCustomersAction, 
  getCustomerAction, 
  createCustomerAction, 
  updateCustomerAction, 
  deleteCustomerAction 
} from "@/app/(dashboard)/customers/actions";

export function useCustomers(filters?: { query?: string; status?: string }) {
  return useQuery({
    queryKey: ["customers", filters],
    queryFn: () => getCustomersAction(filters?.query, filters?.status),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerAction(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerDto) => createCustomerAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created successfully");
    },
    onError: () => {
      toast.error("Failed to create customer");
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerDto }) =>
      updateCustomerAction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", variables.id] });
      toast.success("Customer updated successfully");
    },
    onError: () => {
      toast.error("Failed to update customer");
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomerAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete customer");
    },
  });
}

