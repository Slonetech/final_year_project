import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockSettingsApi } from "@/lib/api/mock-api";
import { CompanySettings, TaxSettings, InvoiceSettings } from "@/lib/types";
import { toast } from "sonner";

// Company Settings Hooks
export function useCompanySettings() {
  return useQuery({
    queryKey: ["company-settings"],
    queryFn: () => mockSettingsApi.getCompanySettings(),
  });
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CompanySettings>) =>
      mockSettingsApi.updateCompanySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      toast.success("Company settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update company settings");
    },
  });
}

// Tax Settings Hooks
export function useTaxSettings() {
  return useQuery({
    queryKey: ["tax-settings"],
    queryFn: () => mockSettingsApi.getTaxSettings(),
  });
}

export function useUpdateTaxSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TaxSettings>) =>
      mockSettingsApi.updateTaxSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-settings"] });
      toast.success("Tax settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update tax settings");
    },
  });
}

// Invoice Settings Hooks
export function useInvoiceSettings() {
  return useQuery({
    queryKey: ["invoice-settings"],
    queryFn: () => mockSettingsApi.getInvoiceSettings(),
  });
}

export function useUpdateInvoiceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<InvoiceSettings>) =>
      mockSettingsApi.updateInvoiceSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-settings"] });
      toast.success("Invoice settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update invoice settings");
    },
  });
}
