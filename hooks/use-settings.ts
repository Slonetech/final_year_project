import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompanySettingsAction,
  updateCompanySettingsAction,
  getTaxSettingsAction,
  updateTaxSettingsAction,
  getInvoiceSettingsAction,
  updateInvoiceSettingsAction,
} from "@/app/(dashboard)/settings/actions";
import { CompanySettings, TaxSettings, InvoiceSettings } from "@/lib/types";
import { toast } from "sonner";

// Company Settings Hooks
export function useCompanySettings() {
  return useQuery({
    queryKey: ["company-settings"],
    queryFn: () => getCompanySettingsAction(),
  });
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Omit<CompanySettings, 'id' | 'updatedAt'>>) =>
      updateCompanySettingsAction(data),
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
    queryFn: () => getTaxSettingsAction(),
  });
}

export function useUpdateTaxSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Omit<TaxSettings, 'id' | 'updatedAt'>>) =>
      updateTaxSettingsAction(data),
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
    queryFn: () => getInvoiceSettingsAction(),
  });
}

export function useUpdateInvoiceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Omit<InvoiceSettings, 'id' | 'updatedAt'>>) =>
      updateInvoiceSettingsAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-settings"] });
      toast.success("Invoice settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update invoice settings");
    },
  });
}
