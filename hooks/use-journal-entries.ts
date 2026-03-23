"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockJournalEntriesApi } from "@/lib/api/mock-api";
import { CreateJournalEntryDto } from "@/lib/types";
import { toast } from "sonner";

interface JournalEntryFilters {
    query?: string;
    status?: string;
}

export function useJournalEntries(filters?: JournalEntryFilters) {
    return useQuery({
        queryKey: ["journal-entries", filters],
        queryFn: () => mockJournalEntriesApi.getAll(filters),
    });
}

export function useJournalEntry(id: string) {
    return useQuery({
        queryKey: ["journal-entries", id],
        queryFn: () => mockJournalEntriesApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateJournalEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateJournalEntryDto) => mockJournalEntriesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
            toast.success("Journal entry created successfully");
        },
        onError: () => {
            toast.error("Failed to create journal entry");
        },
    });
}
