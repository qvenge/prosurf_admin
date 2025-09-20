import { apiClient } from '../config';
import { 
  TelegramUpdateSchema,
} from '../schemas';
import type { 
  TelegramUpdate,
} from '../types';

/**
 * Webhooks API client
 * 
 * Handles webhook endpoints for payment providers and Telegram bot.
 * Note: These endpoints are typically called by external services, not by the client app.
 * They are included here for completeness and testing purposes.
 */
export const webhooksClient = {
  /**
   * Handle payment provider webhook
   * POST /webhooks/payments/provider
   * 
   * Processes webhook notifications from payment providers (Stripe, YooKassa, CloudPayments, etc.).
   * Requires signature validation via X-Signature header.
   * 
   * @param data - Provider-specific webhook payload
   * @param signature - Webhook signature for validation
   * @returns Promise that resolves when webhook is processed
   */
  async handlePaymentProviderWebhook(data: unknown, signature: string): Promise<void> {
    await apiClient.post('/webhooks/payments/provider', data, {
      headers: {
        'X-Signature': signature,
      },
    });
  },

  /**
   * Handle Telegram bot webhook
   * POST /webhooks/telegram/bot
   * 
   * Processes Telegram Bot API updates for payments.
   * - On pre_checkout_query: verify booking hold & amount, answer within 10 seconds
   * - On successful_payment: set Payment=SUCCEEDED and Booking=CONFIRMED
   * 
   * @param data - Telegram update payload
   * @param secretToken - Secret token for Telegram webhook validation
   * @returns Promise that resolves when webhook is processed
   */
  async handleTelegramBotWebhook(data: TelegramUpdate, secretToken: string): Promise<void> {
    const validatedData = TelegramUpdateSchema.parse(data);
    
    await apiClient.post('/webhooks/telegram/bot', validatedData, {
      headers: {
        'X-Telegram-Bot-Api-Secret-Token': secretToken,
      },
    });
  },

  /**
   * Verify webhook signature (utility function)
   * 
   * Helper function to verify webhook signatures from payment providers.
   * Implementation depends on the specific provider's signature algorithm.
   * 
   * @param payload - Raw webhook payload
   * @param signature - Signature to verify
   * @param secret - Webhook secret key
   * @param algorithm - Signature algorithm (e.g., 'sha256', 'sha512')
   * @returns Boolean indicating if signature is valid
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _algorithm: 'sha256' | 'sha512' = 'sha256'
  ): boolean {
    // This would typically use crypto libraries to verify the signature
    // Implementation depends on the payment provider's requirements
    // For example, Stripe uses HMAC-SHA256
    
    // Placeholder implementation - should be replaced with actual verification
    console.warn('Webhook signature verification not yet implemented');
    console.warn('Payload:', payload, 'Signature:', signature, 'Secret:', secret);
    return true;
  },
};