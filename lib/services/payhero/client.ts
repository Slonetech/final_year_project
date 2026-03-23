import axios, { AxiosInstance, AxiosError } from "axios";
import type {
    PayHeroConfig,
    PayHeroErrorResponse,
} from "./types";

/**
 * PayHero API Client
 * Handles all HTTP communication with PayHero API
 * Uses Basic Authentication with API username and password
 */
export class PayHeroClient {
    private client: AxiosInstance;
    private config: PayHeroConfig;

    constructor(config?: PayHeroConfig) {
        // Load config from environment variables if not provided
        this.config = config || {
            apiUsername: process.env.PAYHERO_API_USERNAME || "",
            apiPassword: process.env.PAYHERO_API_PASSWORD || "",
            accountId: process.env.PAYHERO_ACCOUNT_ID || "",
            baseURL: process.env.PAYHERO_BASE_URL || "https://api.payhero.co.ke",
        };

        // Validate configuration
        this.validateConfig();

        // Create axios instance with default config
        this.client = axios.create({
            baseURL: this.config.baseURL,
            timeout: 30000, // 30 seconds
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            auth: {
                username: this.config.apiUsername,
                password: this.config.apiPassword,
            },
        });

        // Add request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                console.log(`[PayHero] ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error("[PayHero] Request error:", error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => {
                console.log(`[PayHero] Response: ${response.status} ${response.statusText}`);
                return response;
            },
            async (error: AxiosError<PayHeroErrorResponse>) => {
                return this.handleError(error);
            }
        );
    }

    /**
     * Validate PayHero configuration
     */
    private validateConfig(): void {
        const requiredFields = ["apiUsername", "apiPassword", "accountId", "baseURL"];
        const missingFields = requiredFields.filter(
            (field) => !this.config[field as keyof PayHeroConfig]
        );

        if (missingFields.length > 0) {
            throw new Error(
                `PayHero configuration incomplete. Missing: ${missingFields.join(", ")}`
            );
        }
    }

    /**
     * Handle API errors with retry logic
     */
    private async handleError(error: AxiosError<PayHeroErrorResponse>): Promise<never> {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            console.error(`[PayHero] API Error ${status}:`, data);

            // Handle specific error codes
            if (status === 401) {
                throw new Error("PayHero authentication failed. Check API credentials.");
            }

            if (status === 429) {
                throw new Error("PayHero rate limit exceeded. Please try again later.");
            }

            if (status >= 500) {
                throw new Error("PayHero service is temporarily unavailable. Please try again.");
            }

            // Return formatted error
            const errorMessage = data?.message || "PayHero API error occurred";
            const errorDetails = data?.errors
                ? Object.entries(data.errors)
                    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
                    .join("; ")
                : "";

            throw new Error(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage);
        } else if (error.request) {
            // Request made but no response received
            console.error("[PayHero] No response received:", error.message);
            throw new Error("Cannot connect to PayHero. Please check your internet connection.");
        } else {
            // Error setting up the request
            console.error("[PayHero] Request setup error:", error.message);
            throw new Error(`PayHero client error: ${error.message}`);
        }
    }

    /**
     * Get axios instance for making requests
     */
    getClient(): AxiosInstance {
        return this.client;
    }

    /**
     * Get account ID
     */
    getAccountId(): string {
        return this.config.accountId;
    }
}

// Export singleton instance
let payHeroClientInstance: PayHeroClient | null = null;

export function getPayHeroClient(): PayHeroClient {
    if (!payHeroClientInstance) {
        payHeroClientInstance = new PayHeroClient();
    }
    return payHeroClientInstance;
}
