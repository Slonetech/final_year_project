// PayHero API Types
// Based on PayHero API documentation

export interface PayHeroInitiatePaymentRequest {
    amount: number;
    phone_number: string; // Format: 254XXXXXXXXX
    channel_id: number; // 1 for M-Pesa, 2 for Card
    provider: string; // "m-pesa" or "card"
    external_reference: string; // Your internal reference
    callback_url?: string; // Webhook URL for status updates
}

export interface PayHeroInitiatePaymentResponse {
    success: boolean;
    transaction_reference: string;
    status: PayHeroPaymentStatus;
    message: string;
    data?: {
        transaction_id: string;
        amount: number;
        phone_number: string;
        provider: string;
        created_at: string;
    };
}

export interface PayHeroPaymentStatusResponse {
    success: boolean;
    data: {
        transaction_id: string;
        transaction_reference: string;
        external_reference: string;
        amount: number;
        phone_number: string;
        provider: string;
        status: PayHeroPaymentStatus;
        created_at: string;
        updated_at: string;
        completed_at?: string;
    };
}

export interface PayHeroTransactionListResponse {
    success: boolean;
    data: PayHeroTransaction[];
    meta: {
        current_page: number;
        total_pages: number;
        total_records: number;
    };
}

export interface PayHeroTransaction {
    transaction_id: string;
    transaction_reference: string;
    external_reference: string;
    amount: number;
    phone_number: string;
    provider: string;
    status: PayHeroPaymentStatus;
    created_at: string;
    updated_at: string;
    completed_at?: string;
}

export type PayHeroPaymentStatus =
    | "pending"
    | "processing"
    | "success"
    | "failed"
    | "cancelled"
    | "expired";

export interface PayHeroWebhookPayload {
    event: "payment.success" | "payment.failed" | "payment.cancelled";
    transaction_id: string;
    transaction_reference: string;
    external_reference: string;
    amount: number;
    phone_number: string;
    provider: string;
    status: PayHeroPaymentStatus;
    timestamp: string;
    signature?: string;
}

export interface PayHeroErrorResponse {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
    error_code?: string;
}

export interface PayHeroConfig {
    apiUsername: string;
    apiPassword: string;
    accountId: string;
    baseURL: string;
}

// Integration with local ERP types
export interface PayHeroPaymentMetadata {
    payHeroTransactionId: string;
    payHeroTransactionReference: string;
    payHeroStatus: PayHeroPaymentStatus;
    payHeroProvider: string;
    payHeroPhoneNumber: string;
    payHeroCreatedAt: string;
    payHeroCompletedAt?: string;
}
