"use client";

import { useState } from "react";
import { useJournalEntries } from "@/hooks/use-journal-entries";
import { JournalEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, CheckCircle2, XCircle } from "lucide-react";

export default function JournalEntriesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filters = {
        query: searchQuery || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
    };

    const { data: entries, isLoading, error } = useJournalEntries(filters);

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-destructive mb-2">Failed to load journal entries</p>
                    <p className="text-sm text-muted-foreground">Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
                    <p className="text-muted-foreground">View and manage general ledger journal entries</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Journal Entry
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Journal Entries</CardTitle>
                    <CardDescription>A list of all journal entries in your general ledger</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 mb-6 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by entry number, description, or reference..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="posted">Posted</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-muted-foreground">Loading journal entries...</p>
                            </div>
                        </div>
                    ) : entries && entries.length > 0 ? (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Entry #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Debits</TableHead>
                                        <TableHead className="text-right">Credits</TableHead>
                                        <TableHead className="text-center">Balanced</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entries.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="font-medium font-mono">{entry.entryNumber}</TableCell>
                                            <TableCell>{formatDate(entry.date)}</TableCell>
                                            <TableCell className="text-muted-foreground">{entry.reference}</TableCell>
                                            <TableCell>{entry.description}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatCurrency(entry.totalDebits)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatCurrency(entry.totalCredits)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {entry.isBalanced ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500 mx-auto" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-destructive mx-auto" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={entry.status === "posted" ? "default" : "secondary"}>
                                                    {entry.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <p className="text-muted-foreground mb-2">No journal entries found</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchQuery || statusFilter !== "all"
                                    ? "Try adjusting your filters"
                                    : "Get started by creating your first journal entry"}
                            </p>
                            {!searchQuery && statusFilter === "all" && (
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Journal Entry
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">About Journal Entries</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>Journal entries are the foundation of double-entry bookkeeping. Every transaction must have equal debits and credits.</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>Draft</strong> entries are pending review and have not yet affected account balances</li>
                        <li><strong>Posted</strong> entries are final and have been applied to the general ledger</li>
                        <li>Total debits must always equal total credits for a balanced entry</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
