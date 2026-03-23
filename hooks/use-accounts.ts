import { useQuery } from "@tanstack/react-query";
import { mockAccountsApi } from "@/lib/api/mock-api";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: () => mockAccountsApi.getAll(),
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ["account", id],
    queryFn: () => mockAccountsApi.getById(id),
    enabled: !!id,
  });
}

export function useAccountsByType(type: string) {
  return useQuery({
    queryKey: ["accounts", "type", type],
    queryFn: () => mockAccountsApi.getByType(type),
  });
}
