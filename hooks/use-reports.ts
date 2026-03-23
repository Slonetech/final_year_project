import { useQuery } from "@tanstack/react-query";
import { mockReportsApi } from "@/lib/api/mock-api";
import { toast } from "sonner";

// Trial Balance Hook
export function useTrialBalance(asOfDate: Date) {
  return useQuery({
    queryKey: ["trial-balance", asOfDate.toISOString()],
    queryFn: () => mockReportsApi.getTrialBalance(asOfDate),
  });
}

// Aged Receivables Hook
export function useAgedReceivables() {
  return useQuery({
    queryKey: ["aged-receivables"],
    queryFn: () => mockReportsApi.getAgedReceivables(),
  });
}

// Aged Payables Hook
export function useAgedPayables() {
  return useQuery({
    queryKey: ["aged-payables"],
    queryFn: () => mockReportsApi.getAgedPayables(),
  });
}

// Balance Sheet Hook
export function useBalanceSheet(asOfDate: Date) {
  return useQuery({
    queryKey: ["balance-sheet", asOfDate.toISOString()],
    queryFn: () => mockReportsApi.getBalanceSheet(asOfDate),
  });
}

// Profit & Loss Hook
export function useProfitLoss(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ["profit-loss", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => mockReportsApi.getProfitLoss(startDate, endDate),
  });
}

// Cash Flow Hook
export function useCashFlow(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ["cash-flow", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => mockReportsApi.getCashFlow(startDate, endDate),
  });
}

// Export to PDF Mock Function
export function useExportToPDF() {
  return {
    exportToPDF: (reportName: string) => {
      toast.success(`Exporting ${reportName} to PDF...`, {
        description: "Your report will be downloaded shortly.",
      });
      // Mock PDF export - in real implementation, would use jsPDF or similar
      console.log(`Exporting ${reportName} to PDF`);
    },
  };
}

// Print Report Function
export function usePrintReport() {
  return {
    printReport: () => {
      window.print();
    },
  };
}
