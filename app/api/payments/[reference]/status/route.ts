import { NextRequest, NextResponse } from "next/server";
import { getPayHeroPaymentService } from "@/lib/services/payhero";

/**
 * GET /api/payments/[reference]/status
 * Get payment status by transaction reference
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ reference: string }> }
) {
    try {
        // In Next.js 16, params is a Promise
        const { reference } = await params;

        if (!reference) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Transaction reference is required",
                },
                { status: 400 }
            );
        }

        const payHeroService = getPayHeroPaymentService();
        const result = await payHeroService.getPaymentStatus(reference);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("[API] Payment status check error:", error);

        const errorMessage = error instanceof Error ? error.message : "Failed to get payment status";

        return NextResponse.json(
            {
                success: false,
                message: errorMessage,
            },
            { status: 500 }
        );
    }
}
