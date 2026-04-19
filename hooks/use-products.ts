import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProductDto, UpdateProductDto } from "@/lib/types";
import { toast } from "sonner";
import { 
  getProductsAction, 
  getProductAction, 
  createProductAction, 
  updateProductAction, 
  deleteProductAction 
} from "@/app/(dashboard)/inventory/actions";

export function useProducts(filters?: { query?: string; category?: string }) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProductsAction(filters?.query, filters?.category),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductAction(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => createProductAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: () => {
      toast.error("Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      updateProductAction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      toast.success("Product updated successfully");
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProductAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });
}

