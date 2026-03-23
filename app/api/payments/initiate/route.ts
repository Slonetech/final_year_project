import { NextRequest, NextResponse } from "next/server";
import { getPayHeroPaymentService } from "@/lib/services/payhero";
import type { PayHeroInitiatePaymentRequest } from "@/lib/services/payhero/types";

/**
 * POST /api/payments/initiate
 * Initiate a new PayHero payment (M-Pesa or Card)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const { amount, phone_number, provider, external_reference } = body;

        if (!amount || !phone_number || !provider || !external_reference) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields: amount, phone_number, provider, external_reference",
                },
                { status: 400 }
            );
        }

        // Validate amount
        if (typeof amount !== "number" || amount <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid amount. Must be a positive number.",
                },
                { status: 400 }
            );
        }

        // Prepare PayHero request
        const payHeroService = getPayHeroPaymentService();

        // Format phone number
        const formattedPhone = payHeroService.formatPhoneNumber(phone_number);

        const paymentRequest: PayHeroInitiatePaymentRequest = {
            amount,
            phone_number: formattedPhone,
            channel_id: provider === "m-pesa" ? 1 : 2,
            provider,
            external_reference,
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
        };

        // Initiate payment
        const result = await payHeroService.initiatePayment(paymentRequest);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        // Enhanced error logging
        console.error("[API] Payment initiation error:");
        console.error("Error type:", error instanceof Error ? "Error" : typeof error);
        console.error("Error message:", error instanceof Error ? error.message : error);
        console.error("Full error:", error);

        const errorMessage = error instanceof Error ? error.message : "Payment initiation failed";

        return NextResponse.json(
            {
                success: false,
                message: errorMessage,
            },
            { status: 500 }
        );
    }
}
