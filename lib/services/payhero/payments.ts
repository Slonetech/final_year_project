import { getPayHeroClient } from "./client";
import type {
    PayHeroInitiatePaymentRequest,
    PayHeroInitiatePaymentResponse,
    PayHeroPaymentStatusResponse,
    PayHeroTransactionListResponse,
    PayHeroTransaction,
} from "./types";

/**
 * PayHero Payments Service
 * Handles all payment-related operations with PayHero API
 */
export class PayHeroPaymentService {
    /**
     * Initiate a new payment via M-Pesa or Card
     */
    async initiatePayment(
        params: PayHeroInitiatePaymentRequest
    ): Promise<PayHeroInitiatePaymentResponse> {
        const client = getPayHeroClient();

        // Validate phone number format for M-Pesa
        if (params.provider === "m-pesa") {
            this.validateKenyanPhoneNumber(params.phone_number);
        }

        try {
            const response = await client.getClient().post<PayHeroInitiatePaymentResponse>(
                "/api/v1/payments/initiate",
                {
                    ...params,
                    account_id: client.getAccountId(),
                }
            );

            return response.data;
        } catch (error) {
            console.error("[PayHero] Payment initiation failed:", error);
            throw error;
        }
    }

    /**
     * Get payment status by transaction reference
     */
    async getPaymentStatus(transactionReference: string): Promise<PayHeroPaymentStatusResponse> {
        const client = getPayHeroClient();

        try {
            const response = await client.getClient().get<PayHeroPaymentStatusResponse>(
                `/api/v1/payments/${transactionReference}/status`
            );

            return response.data;
        } catch (error) {
            console.error("[PayHero] Failed to get payment status:", error);
            throw error;
        }
    }

    /**
     * List all transactions with optional filters
     */
    async listTransactions(params?: {
        page?: number;
        limit?: number;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<PayHeroTransactionListResponse> {
        const client = getPayHeroClient();

        try {
            const response = await client.getClient().get<PayHeroTransactionListResponse>(
                "/api/v1/transactions",
                {
                    params: {
                        account_id: client.getAccountId(),
                        ...params,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("[PayHero] Failed to list transactions:", error);
            throw error;
        }
    }

    /**
     * Validate Kenyan phone number format
     */
    private validateKenyanPhoneNumber(phoneNumber: string): void {
        // Remove any spaces or special characters
        const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");

        // Check if it matches Kenyan format: 254XXXXXXXXX (12 digits total)
        const kenyanPattern = /^254[17]\d{8}$/;

        if (!kenyanPattern.test(cleaned)) {
            throw new Error(
                "Invalid Kenyan phone number format. Expected format: 254XXXXXXXXX (e.g., 254712345678)"
            );
        }
    }

    /**
     * Helper to format phone number to PayHero format
     */
    formatPhoneNumber(phoneNumber: string): string {
        // Remove any spaces, dashes, or parentheses
        let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");

        // If it starts with 0, replace with 254
        if (cleaned.startsWith("0")) {
            cleaned = "254" + cleaned.substring(1);
        }

        // If it starts with +254, remove the +
        if (cleaned.startsWith("+254")) {
            cleaned = cleaned.substring(1);
        }

        return cleaned;
    }
}

// Export singleton instance
let payHeroPaymentServiceInstance: PayHeroPaymentService | null = null;

export function getPayHeroPaymentService(): PayHeroPaymentService {
    if (!payHeroPaymentServiceInstance) {
        payHeroPaymentServiceInstance = new PayHeroPaymentService();
    }
    return payHeroPaymentServiceInstance;
}
