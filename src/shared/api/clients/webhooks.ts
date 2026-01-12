import { apiClient } from '../config';
import { 
  TelegramUpdateSchema,
} from '../schemas';
import type { 
  TelegramUpdate,
} from '../types';

/**
 * API-клиент вебхуков.
 * Обрабатывает вебхуки платёжных провайдеров и Telegram-бота.
 * Эти эндпоинты обычно вызываются внешними сервисами, а не клиентским приложением.
 */
export const webhooksClient = {
  /**
   * Обработка вебхука платёжного провайдера.
   * POST /webhooks/payments/provider
   *
   * @param signature - Подпись вебхука для валидации
   */
  async handlePaymentProviderWebhook(data: unknown, signature: string): Promise<void> {
    await apiClient.post('/webhooks/payments/provider', data, {
      headers: {
        'X-Signature': signature,
      },
    });
  },

  /**
   * Обработка вебхука Telegram-бота.
   * POST /webhooks/telegram/bot
   *
   * Обрабатывает обновления Telegram Bot API для платежей:
   * - pre_checkout_query: проверка холда и суммы, ответ в течение 10 секунд
   * - successful_payment: статус Payment=SUCCEEDED и Booking=CONFIRMED
   *
   * @param secretToken - Секретный токен для валидации вебхука Telegram
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
   * Проверка подписи вебхука (утилита).
   * Реализация зависит от алгоритма подписи конкретного провайдера.
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _algorithm: 'sha256' | 'sha512' = 'sha256'
  ): boolean {
    // Placeholder — должна быть заменена реальной верификацией
    console.warn('Webhook signature verification not yet implemented');
    console.warn('Payload:', payload, 'Signature:', signature, 'Secret:', secret);
    return true;
  },
};