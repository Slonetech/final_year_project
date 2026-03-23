import { NextRequest, NextResponse } from "next/server";
import { getPayHeroWebhookService } from "@/lib/services/payhero";
import type { PayHeroWebhookPayload } from "@/lib/services/payhero/types";

/**
 * POST /api/payments/webhook
 * PayHero webhook endpoint for payment status updates
 */
export async function POST(request: NextRequest) {
    try {
        const body: PayHeroWebhookPayload = await request.json();

        console.log("[Webhook] Received PayHero webhook:", body.event);

        // TODO: Verify webhook signature
        // const signature = request.headers.get("x-payhero-signature");
        // if (signature) {
        //   const webhookService = getPayHeroWebhookService();
        //   const isValid = webhookService.verifySignature(
        //     JSON.stringify(body),
        //     signature,
        //     process.env.PAYHERO_WEBHOOK_SECRET || ""
        //   );
        //   
        //   if (!isValid) {
        //     return NextResponse.json(
        //       { success: false, message: "Invalid signature" },
        //       { status: 401 }
        //     );
        //   }
        // }

        // Process webhook
        const webhookService = getPayHeroWebhookService();
        await webhookService.processWebhook(body);

        return NextResponse.json({ success: true, message: "Webhook processed" }, { status: 200 });
    } catch (error) {
        console.error("[Webhook] Processing error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Webhook processing failed",
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/payments/webhook
 * Webhook verification endpoint (for PayHero to verify URL)
 */
export async function GET(request: NextRequest) {
    return NextResponse.json(
        {
            success: true,
            message: "PayHero webhook endpoint is active",
        },
        { status: 200 }
    );
}
