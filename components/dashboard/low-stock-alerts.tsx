"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface Alert {
  productId: string;
  productName: string;
  reorderPoint: number;
  currentStock: number;
}

interface LowStockAlertsProps {
  lowStockAlerts?: Alert[];
}

export function LowStockAlerts({ lowStockAlerts }: LowStockAlertsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Low Stock Alerts
        </CardTitle>
        <CardDescription>Products below reorder point</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lowStockAlerts && lowStockAlerts.length > 0 ? (
            lowStockAlerts.map((alert) => (
              <div key={alert.productId} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{alert.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    Reorder at: {alert.reorderPoint} units
                  </p>
                </div>
                <Badge variant="destructive">{alert.currentStock} units</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              All stock levels are healthy
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
