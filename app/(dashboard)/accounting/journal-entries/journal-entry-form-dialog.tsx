"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Account } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createJournalEntryAction } from "./actions";
import { toast } from "sonner";

const journalLineSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  description: z.string().optional(),
  debit: z.number().min(0),
  credit: z.number().min(0),
}).refine(
  (data) => {
    // A line must have either a debit or a credit, but not both or neither
    const hasDebit = data.debit > 0;
    const hasCredit = data.credit > 0;
    return (hasDebit || hasCredit) && !(hasDebit && hasCredit);
  },
  {
    message: "A line must have either a debit or a credit (not both)",
    path: ["credit"], // Attach error to credit field by default
  }
);

const journalEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  reference: z.string().optional(),
  lines: z.array(journalLineSchema).min(2, "At least two lines are required for a double-entry journal"),
}).refine(
  (data) => {
    // Total debits must equal total credits
    const totalDebits = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredits = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    // Allow for small floating point differences
    return Math.abs(totalDebits - totalCredits) < 0.01;
  },
  {
    message: "Total debits must equal total credits",
    path: ["lines"],
  }
);

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface JournalEntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
}

export function JournalEntryFormDialog({
  open,
  onOpenChange,
  accounts,
}: JournalEntryFormDialogProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      description: "",
      reference: "",
      lines: [
        { accountId: "", description: "", debit: 0, credit: 0 },
        { accountId: "", description: "", debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Calculate totals for display
  const lines = form.watch("lines");
  const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const outOfBalance = Math.abs(totalDebits - totalCredits) >= 0.01;
  const difference = Math.abs(totalDebits - totalCredits);

  // Group accounts by type for the select dropdown
  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  // Sort account types for consistent display
  const accountTypes = ["asset", "liability", "equity", "revenue", "expense"];

  const onSubmit = async (data: JournalEntryFormData) => {
    startTransition(async () => {
      try {
        await createJournalEntryAction(data);
        toast.success("Journal entry recorded successfully");
        onOpenChange(false);
        form.reset();
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("Failed to record journal entry");
      }
    });
  };

  const isSubmitting = isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Journal Entry</DialogTitle>
          <DialogDescription>
            Record a manual journal entry. Total debits must equal total credits.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. ADJ-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>Description / Memo *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Purpose of this journal entry" 
                        {...field} 
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Lines matching standard accounting layout */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Entry Lines</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ accountId: "", description: "", debit: 0, credit: 0 })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </div>

              {form.formState.errors.lines?.root && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Error</AlertTitle>
                  <AlertDescription>
                    {form.formState.errors.lines.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 font-medium text-sm border-b">
                  <div className="col-span-4">Account *</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2 text-right">Debit</div>
                  <div className="col-span-2 text-right">Credit</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                <div className="divide-y">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 p-3 items-start">
                      {/* Account */}
                      <div className="col-span-4">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.accountId`}
                          render={({ field: selectField }) => (
                            <FormItem>
                              <Select onValueChange={selectField.onChange} value={selectField.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {accountTypes.map((type) => {
                                    if (!groupedAccounts[type] || groupedAccounts[type].length === 0) return null;
                                    return (
                                      <div key={type}>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                                          {type}
                                        </div>
                                        {groupedAccounts[type].map((account) => (
                                          <SelectItem key={account.id} value={account.id}>
                                            {account.code} - {account.name}
                                          </SelectItem>
                                        ))}
                                      </div>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Line Description */}
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.description`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Line detail..." {...inputField} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Debit */}
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.debit`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  className="text-right"
                                  {...inputField}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    inputField.onChange(val);
                                    // If debit is entered, clear credit
                                    if (val > 0) {
                                      form.setValue(`lines.${index}.credit`, 0, { shouldValidate: true });
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Credit */}
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.credit`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  className="text-right"
                                  {...inputField}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    inputField.onChange(val);
                                    // If credit is entered, clear debit
                                    if (val > 0) {
                                      form.setValue(`lines.${index}.debit`, 0, { shouldValidate: true });
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Action */}
                      <div className="col-span-1 flex justify-center pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 2}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Footer */}
                <div className="grid grid-cols-12 gap-2 p-4 bg-muted/30 border-t items-center">
                  <div className="col-span-7 text-right font-semibold text-lg">
                    Totals:
                  </div>
                  <div className="col-span-2 text-right font-bold font-mono text-lg">
                    {formatCurrency(totalDebits)}
                  </div>
                  <div className="col-span-2 text-right font-bold font-mono text-lg">
                    {formatCurrency(totalCredits)}
                  </div>
                  <div className="col-span-1"></div>
                </div>
              </div>

              {/* Balance Indicator */}
              <div className="flex justify-end p-2 mb-4 mt-2">
                {totalDebits > 0 || totalCredits > 0 ? (
                  outOfBalance ? (
                    <div className="text-destructive flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Out of balance by {formatCurrency(difference)}
                    </div>
                  ) : (
                    <div className="text-green-600 dark:text-green-500 font-medium bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-md border border-green-200 dark:border-green-800">
                      Balanced
                    </div>
                  )
                ) : null}
              </div>
            </div>

            <DialogFooter className="mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || outOfBalance || (totalDebits === 0 && totalCredits === 0)}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Post Journal Entry"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
