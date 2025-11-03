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
