"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Transaction {
  id: string;
  description: string;
  reference: string;
  date: string;
  status: string;
  amount: number;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest 10 transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions?.slice(0, 10).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">
                  {transaction.reference} • {formatDate(transaction.date)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {transaction.status && (
                  <Badge variant={transaction.status === "paid" ? "default" : "secondary"}>
                    {transaction.status}
                  </Badge>
                )}
                <p className="font-medium">{formatCurrency(transaction.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
