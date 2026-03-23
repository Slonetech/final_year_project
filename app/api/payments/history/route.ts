import { NextRequest, NextResponse } from "next/server";
import { getPayHeroPaymentService } from "@/lib/services/payhero";

/**
 * GET /api/payments/history
 * Fetch PayHero transaction history
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const status = searchParams.get("status") || undefined;
        const startDate = searchParams.get("startDate") || undefined;
        const endDate = searchParams.get("endDate") || undefined;

        const payHeroService = getPayHeroPaymentService();
        const result = await payHeroService.listTransactions({
            page,
            limit,
            status,
            startDate,
            endDate,
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("[API] Transaction list error:", error);

        const errorMessage = error instanceof Error ? error.message : "Failed to fetch transactions";

        return NextResponse.json(
            {
                success: false,
                message: errorMessage,
            },
            { status: 500 }
        );
    }
}
