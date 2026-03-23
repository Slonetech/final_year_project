import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock, Ban } from "lucide-react";
import type { PayHeroPaymentStatus } from "@/lib/services/payhero/types";

interface PaymentStatusBadgeProps {
    status: PayHeroPaymentStatus;
    showIcon?: boolean;
}

export function PaymentStatusBadge({ status, showIcon = true }: PaymentStatusBadgeProps) {
    const getStatusConfig = (status: PayHeroPaymentStatus) => {
        switch (status) {
            case "pending":
                return {
                    label: "Pending",
                    variant: "secondary" as const,
                    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                    Icon: Clock,
                };
            case "processing":
                return {
                    label: "Processing",
                    variant: "secondary" as const,
                    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
                    Icon: Loader2,
                    iconClass: "animate-spin",
                };
            case "success":
                return {
                    label: "Success",
                    variant: "default" as const,
                    className: "bg-green-100 text-green-800 hover:bg-green-200",
                    Icon: CheckCircle2,
                };
            case "failed":
                return {
                    label: "Failed",
                    variant: "destructive" as const,
                    className: "bg-red-100 text-red-800 hover:bg-red-200",
                    Icon: XCircle,
                };
            case "cancelled":
                return {
                    label: "Cancelled",
                    variant: "secondary" as const,
                    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
                    Icon: Ban,
                };
            case "expired":
                return {
                    label: "Expired",
                    variant: "secondary" as const,
                    className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
                    Icon: Ban,
                };
            default:
                return {
                    label: status,
                    variant: "secondary" as const,
                    className: "",
                    Icon: Clock,
                };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.Icon;

    return (
        <Badge variant={config.variant} className={config.className}>
            {showIcon && <Icon className={`w-3 h-3 mr-1 ${config.iconClass || ""}`} />}
            {config.label}
        </Badge>
    );
}
