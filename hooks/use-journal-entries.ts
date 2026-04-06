"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllJournalEntriesAction,
  createJournalEntryAction,
} from "@/app/(dashboard)/accounting/actions";
import { CreateJournalEntryDto } from "@/lib/types";
import { toast } from "sonner";

interface JournalEntryFilters {
  query?: string;
  status?: string;
}

export function useJournalEntries(filters?: JournalEntryFilters) {
  return useQuery({
    queryKey: ["journal-entries", filters],
    queryFn: () => getAllJournalEntriesAction(filters),
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entry, lines }: { entry: CreateJournalEntryDto; lines: any[] }) =>
      createJournalEntryAction(entry, lines),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      toast.success("Journal entry created successfully");
    },
    onError: () => {
      toast.error("Failed to create journal entry");
    },
  });
}
