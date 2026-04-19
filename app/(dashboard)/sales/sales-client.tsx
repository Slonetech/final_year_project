"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SalesOrder, SalesOrderStatus, Customer, Product } from "@/lib/types";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MoreHorizontal, Plus, Search, Eye, Trash2 } from "lucide-react";
import { deleteSalesOrderAction, getSalesOrderByIdAction } from "./actions";
import { toast } from "sonner";
import { SalesOrderFormDialog } from "./sales-order-form-dialog";

const statusColor: Record<string, string> = {
    quote: "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
    order: "bg-yellow-500 text-white dark:bg-yellow-500 dark:text-white",
    delivered: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
    paid: "bg-green-600 text-white dark:bg-green-500 dark:text-white",
};

export default function SalesClient({
  initialOrders,
  query,
  status,
  customers,
  products,
}: {
  initialOrders: SalesOrder[];
  query: string;
  status: string;
  customers: Customer[];
  products: Product[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState(query);
    const [statusFilter, setStatusFilter] = useState(status);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const updateFilters = (newQuery: string, newStatus: string) => {
        startTransition(() => {
            const params = new URLSearchParams();
            if (newQuery) params.set("query", newQuery);
            if (newStatus && newStatus !== "all") params.set("status", newStatus);
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        updateFilters(val, statusFilter);
    };

    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        updateFilters(searchQuery, val);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this sales order?")) {
            try {
                await deleteSalesOrderAction(id);
                toast.success("Sales order deleted successfully");
            } catch (e) {
                toast.error("Failed to delete sales order");
            }
        }
    };

    const handleViewDetails = async (id: string) => {
        setIsLoadingDetails(true);
        try {
            const order = await getSalesOrderByIdAction(id);
            setSelectedOrder(order as SalesOrder);
            setDetailsOpen(true);
        } catch (e) {
            toast.error("Failed to load sales order details");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
                    <p className="text-muted-foreground">Manage your sales orders</p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Sales Order
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Sales Orders</CardTitle>
                    <CardDescription>A list of all sales orders in your system</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 mb-6 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by order number or customer..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="quote">Quote</SelectItem>
                                <SelectItem value="order">Order</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isPending ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-muted-foreground">Refreshing sales orders...</p>
                            </div>
                        </div>
                    ) : initialOrders.length > 0 ? (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Order Date</TableHead>
                                        <TableHead>Delivery Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="w-[70px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {initialOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium font-mono">{order.orderNumber}</TableCell>
                                            <TableCell>{order.customerName}</TableCell>
                                            <TableCell>{formatDate(order.orderDate)}</TableCell>
                                            <TableCell>{formatDate(order.deliveryDate)}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[order.status]}`}
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
                                                        <DropdownMenuItem onClick={() => handleViewDetails(order.id)}>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            {isLoadingDetails ? "Loading..." : "View Details"}
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
                            <p className="text-muted-foreground mb-2">No sales orders found</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchQuery || statusFilter !== "all"
                                    ? "Try adjusting your filters"
                                    : "Get started by creating your first sales order"}
                            </p>
                            {!searchQuery && statusFilter === "all" && (
                                <Button onClick={() => setDialogOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Sales Order
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <SalesOrderFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                customers={customers}
                products={products}
            />

            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Sales Order Details</DialogTitle>
                        <DialogDescription>
                            {selectedOrder?.orderNumber || "Order"}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Customer</p>
                                    <p className="font-medium">{selectedOrder.customerName || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <p className="font-medium capitalize">{selectedOrder.status}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Order Date</p>
                                    <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Delivery Date</p>
                                    <p className="font-medium">{formatDate(selectedOrder.deliveryDate)}</p>
                                </div>
                            </div>

                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(selectedOrder.lines || []).length > 0 ? (
                                            selectedOrder.lines.map((line) => (
                                                <TableRow key={line.id}>
                                                    <TableCell>{line.productName}</TableCell>
                                                    <TableCell className="text-right">{line.quantity}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(line.unitPrice)}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(line.total)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    No line items found for this order.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="space-y-2 text-sm max-w-sm ml-auto">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(selectedOrder.subtotal || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>{formatCurrency(selectedOrder.taxAmount || 0)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-semibold text-base">
                                    <span>Total</span>
                                    <span>{formatCurrency(selectedOrder.total || 0)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No details available.</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
