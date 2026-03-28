"use client";

import { useState, useMemo } from "react";
import { PurchaseOrder, PurchaseOrderStatus, Supplier, Product } from "@/lib/types";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MoreHorizontal, Plus, Search, Eye, Trash2 } from "lucide-react";
import { deletePurchaseOrderAction } from "./actions";
import { toast } from "sonner";
import { PurchaseOrderFormDialog } from "./purchase-order-form-dialog";

const statusColor: Record<string, string> = {
    pending: "bg-slate-300 text-slate-950 border-slate-400 dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600",
    approved: "bg-orange-300 text-orange-950 border-orange-400 dark:bg-orange-700 dark:text-orange-50 dark:border-orange-600",
    received: "bg-sky-300 text-sky-950 border-sky-400 dark:bg-sky-700 dark:text-sky-50 dark:border-sky-600",
    completed: "bg-emerald-300 text-emerald-950 border-emerald-400 dark:bg-emerald-700 dark:text-emerald-50 dark:border-emerald-600",
};


export default function PurchasesClient({
    initialOrders,
    suppliers,
    products,
}: {
    initialOrders: PurchaseOrder[];
    suppliers: Supplier[];
    products: Product[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);

    // Client-side filtering
    const filteredOrders = useMemo(() => {
        return initialOrders.filter((order) => {
            // Status filter
            if (statusFilter !== "all" && order.status !== statusFilter) {
                return false;
            }

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(query);
                const matchesSupplier = order.supplierName?.toLowerCase().includes(query);
                const matchesTotal = order.total?.toString().includes(query);

                return matchesOrderNumber || matchesSupplier || matchesTotal;
            }

            return true;
        });
    }, [initialOrders, searchQuery, statusFilter]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this purchase order?")) {
            try {
                await deletePurchaseOrderAction(id);
                toast.success("Purchase order deleted successfully");
            } catch (e) {
                toast.error("Failed to delete purchase order");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
                    <p className="text-muted-foreground">Manage your purchase orders</p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Purchase Order
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Purchase Orders</CardTitle>
                    <CardDescription>A list of all purchase orders in your system</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 mb-6 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by order number or supplier..."
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
                                <SelectItem value="pending">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border ${statusColor.pending}`}>
                                        Pending
                                    </span>
                                </SelectItem>
                                <SelectItem value="approved">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border ${statusColor.approved}`}>
                                        Approved
                                    </span>
                                </SelectItem>
                                <SelectItem value="received">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border ${statusColor.received}`}>
                                        Received
                                    </span>
                                </SelectItem>
                                <SelectItem value="completed">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border ${statusColor.completed}`}>
                                        Completed
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {filteredOrders.length > 0 ? (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Order Date</TableHead>
                                        <TableHead>Expected Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="w-[70px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium font-mono">{order.orderNumber}</TableCell>
                                            <TableCell>{order.supplierName}</TableCell>
                                            <TableCell>{formatDate(order.orderDate)}</TableCell>
                                            <TableCell>{formatDate(order.expectedDate)}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border ${statusColor[order.status] ||
                                                        "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(order.total)}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(order.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <p className="text-muted-foreground mb-2">No purchase orders found</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchQuery || statusFilter !== "all"
                                    ? "Try adjusting your filters"
                                    : "Get started by creating your first purchase order"}
                            </p>
                            {!searchQuery && statusFilter === "all" && (
                                <Button onClick={() => setDialogOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Purchase Order
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <PurchaseOrderFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                suppliers={suppliers}
                products={products}
            />
        </div>
    );
}
