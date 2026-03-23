import crypto from "crypto";
import type { PayHeroWebhookPayload } from "./types";

/**
 * PayHero Webhook Service
 * Handles webhook verification and processing
 */
export class PayHeroWebhookService {
    /**
     * Verify webhook signature
     * Note: Update this method based on PayHero's actual signature mechanism
     */
    verifySignature(payload: string, signature: string, secret: string): boolean {
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(payload)
            .digest("hex");

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }

    /**
     * Process webhook payload
     */
    async processWebhook(payload: PayHeroWebhookPayload): Promise<void> {
        console.log("[PayHero Webhook] Received event:", payload.event);
        console.log("[PayHero Webhook] Transaction:", payload.transaction_reference);
        console.log("[PayHero Webhook] Status:", payload.status);

        // Handle different webhook events
        switch (payload.event) {
            case "payment.success":
                await this.handlePaymentSuccess(payload);
                break;

            case "payment.failed":
                await this.handlePaymentFailed(payload);
                break;

            case "payment.cancelled":
                await this.handlePaymentCancelled(payload);
                break;

            default:
                console.warn("[PayHero Webhook] Unknown event type:", payload.event);
        }
    }

    /**
     * Handle successful payment webhook
     */
    private async handlePaymentSuccess(payload: PayHeroWebhookPayload): Promise<void> {
        console.log("[PayHero] Payment successful:", {
            reference: payload.transaction_reference,
            amount: payload.amount,
            phone: payload.phone_number,
        });

        // TODO: Update local database/storage with payment status
        // This will be implemented when we add database integration
    }

    /**
     * Handle failed payment webhook
     */
    private async handlePaymentFailed(payload: PayHeroWebhookPayload): Promise<void> {
        console.log("[PayHero] Payment failed:", {
            reference: payload.transaction_reference,
            external_ref: payload.external_reference,
        });

        // TODO: Update local database/storage with failed status
        // Send notification to admin/user
    }

    /**
     * Handle cancelled payment webhook
     */
    private async handlePaymentCancelled(payload: PayHeroWebhookPayload): Promise<void> {
        console.log("[PayHero] Payment cancelled:", {
            reference: payload.transaction_reference,
            external_ref: payload.external_reference,
        });

        // TODO: Update local database/storage with cancelled status
    }
}

// Export singleton instance
let payHeroWebhookServiceInstance: PayHeroWebhookService | null = null;

export function getPayHeroWebhookService(): PayHeroWebhookService {
    if (!payHeroWebhookServiceInstance) {
        payHeroWebhookServiceInstance = new PayHeroWebhookService();
    }
    return payHeroWebhookServiceInstance;
}
