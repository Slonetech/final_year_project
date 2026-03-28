"use client";

import { useState, useMemo } from "react";
import { Account, AccountType } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AccountFormDialog } from "./account-form-dialog";

// Account type configuration
const accountTypeConfig: Record<AccountType, { label: string; description: string; color: string }> = {
  asset: {
    label: "Assets",
    description: "Resources owned by the business",
    color: "bg-blue-500",
  },
  liability: {
    label: "Liabilities",
    description: "Obligations owed by the business",
    color: "bg-red-500",
  },
  equity: {
    label: "Equity",
    description: "Owner's stake in the business",
    color: "bg-purple-500",
  },
  revenue: {
    label: "Revenue",
    description: "Income earned from operations",
    color: "bg-green-500",
  },
  expense: {
    label: "Expenses",
    description: "Costs incurred in operations",
    color: "bg-orange-500",
  },
};

interface AccountTreeNode extends Account {
  children?: AccountTreeNode[];
}

export default function ChartOfAccountsClient({ initialAccounts }: { initialAccounts: Account[] }) {
  const [expandedTypes, setExpandedTypes] = useState<Set<AccountType>>(
    new Set(["asset", "liability", "equity", "revenue", "expense"])
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const emptyTree: Record<AccountType, AccountTreeNode[]> = {
    asset: [],
    liability: [],
    equity: [],
    revenue: [],
    expense: [],
  };

  const emptyTotals: Record<AccountType, number> = {
    asset: 0,
    liability: 0,
    equity: 0,
    revenue: 0,
    expense: 0,
  };

  const accountTree = useMemo(() => {
    if (!initialAccounts) return emptyTree;

    const tree: Record<AccountType, AccountTreeNode[]> = {
      asset: [],
      liability: [],
      equity: [],
      revenue: [],
      expense: [],
    };

    const accountMap = new Map<string, AccountTreeNode>();
    initialAccounts.forEach((account) => {
      accountMap.set(account.id, { ...account, children: [] });
    });

    initialAccounts.forEach((account) => {
      const node = accountMap.get(account.id)!;

      if (account.parentId) {
        const parent = accountMap.get(account.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      } else {
        if (tree[account.type]) {
            tree[account.type].push(node);
        }
      }
    });

    return tree;
  }, [initialAccounts]);

  const accountTypeTotals = useMemo(() => {
    if (!initialAccounts) return emptyTotals;

    const totals: Record<AccountType, number> = {
      asset: 0,
      liability: 0,
      equity: 0,
      revenue: 0,
      expense: 0,
    };

    initialAccounts.forEach((account) => {
      const hasChildren = initialAccounts.some(a => a.parentId === account.id);
      if (!hasChildren && account.balance) {
        if (totals[account.type] !== undefined) {
          totals[account.type] += account.balance;
        }
      }
    });

    return totals;
  }, [initialAccounts]);

  const toggleTypeExpansion = (type: AccountType) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  const renderAccountNode = (account: AccountTreeNode, level: number = 0) => {
    const hasChildren = account.children && account.children.length > 0;

    return (
      <div key={account.id}>
        <div
          className={cn(
            "flex items-center justify-between py-3 px-4 hover:bg-muted/50 transition-colors border-b",
            level === 0 && "font-semibold",
            level === 1 && "pl-8",
            level === 2 && "pl-16",
            level === 3 && "pl-24"
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasChildren ? (
              <div className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
            <div className="flex items-center gap-4 flex-1">
              <span className="text-sm text-muted-foreground font-mono min-w-[80px]">
                {account.code}
              </span>
              <span className={cn(level === 0 ? "text-base" : "text-sm")}>
                {account.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground capitalize min-w-[120px]">
              {account.category.replace(/_/g, " ")}
            </span>

            <span
              className={cn(
                "text-sm font-medium min-w-[140px] text-right",
                account.balance > 0 && "text-green-600 dark:text-green-400",
                account.balance < 0 && "text-red-600 dark:text-red-400",
                account.balance === 0 && "text-muted-foreground"
              )}
            >
              {formatCurrency(account.balance)}
            </span>

            <Badge
              variant={account.status === "active" ? "default" : "secondary"}
              className="min-w-[70px] justify-center"
            >
              {account.status}
            </Badge>
          </div>
        </div>

        {hasChildren && (
          <div className="bg-muted/20">
            {account.children!.map((child) => renderAccountNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderAccountTypeSection = (type: AccountType) => {
    const config = accountTypeConfig[type];
    const isExpanded = expandedTypes.has(type);
    const accountsOfType = accountTree[type] || [];
    const total = accountTypeTotals[type] || 0;

    if (accountsOfType.length === 0) return null;

    return (
      <Card key={type} className="overflow-hidden">
        <div
          className="cursor-pointer"
          onClick={() => toggleTypeExpansion(type)}
        >
          <CardHeader className="hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className={cn("w-3 h-3 rounded-full", config.color)} />
                </div>
                <div>
                  <CardTitle className="text-xl">{config.label}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Total</div>
                <div
                  className={cn(
                    "text-xl font-bold",
                    total > 0 && "text-green-600 dark:text-green-400",
                    total < 0 && "text-red-600 dark:text-red-400"
                  )}
                >
                  {formatCurrency(total)}
                </div>
              </div>
            </div>
          </CardHeader>
        </div>

        {isExpanded && (
          <CardContent className="p-0">
            <div className="border-t">
              <div className="flex items-center justify-between py-3 px-4 bg-muted/50 border-b font-semibold text-sm">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-4 h-4" />
                  <div className="flex items-center gap-4 flex-1">
                    <span className="min-w-[80px]">Code</span>
                    <span>Account Name</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="min-w-[120px]">Category</span>
                  <span className="min-w-[140px] text-right">Balance</span>
                  <span className="min-w-[70px] text-center">Status</span>
                </div>
              </div>

              <div>
                {accountsOfType.map((account: AccountTreeNode) => renderAccountNode(account))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-muted-foreground">
            View your complete account hierarchy and balances
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {initialAccounts && initialAccounts.length > 0 ? (
        <div className="space-y-4">
          {(["asset", "liability", "equity", "revenue", "expense"] as AccountType[]).map(
            renderAccountTypeSection
          )}

          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
              <CardDescription>Overview of all account types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {(["asset", "liability", "equity", "revenue", "expense"] as AccountType[]).map(
                  (type) => {
                    const config = accountTypeConfig[type];
                    const total = (accountTypeTotals as Record<AccountType, number>)[type] || 0;
                    const accountCount = ((accountTree as Record<AccountType, AccountTreeNode[]>)[type] || []).reduce(
                      (count: number, account: AccountTreeNode) => {
                        const childCount = account.children ? account.children.length : 0;
                        return count + 1 + childCount;
                      },
                      0
                    );

                    return (
                      <div
                        key={type}
                        className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn("w-3 h-3 rounded-full", config.color)} />
                          <span className="font-semibold">{config.label}</span>
                        </div>
                        <div
                          className={cn(
                            "text-2xl font-bold mb-1",
                            total > 0 && "text-green-600 dark:text-green-400",
                            total < 0 && "text-red-600 dark:text-red-400"
                          )}
                        >
                          {formatCurrency(total)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {accountCount} {accountCount === 1 ? "account" : "accounts"}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 text-center border rounded-md">
          <p className="text-muted-foreground mb-2">No accounts found</p>
          <p className="text-sm text-muted-foreground mb-4">
            The chart of accounts is empty. Please add accounts to get started.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
             <Plus className="w-4 h-4 mr-2" />
             Add Account
          </Button>
        </div>
      )}

      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        accounts={initialAccounts}
      />
    </div>
  );
}
