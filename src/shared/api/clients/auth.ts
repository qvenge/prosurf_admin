import { apiClient, validateResponse } from '../config';
import {
  TelegramLoginDtoSchema,
  AdminLoginDtoSchema,
  AdminAuthResponseSchema,
  ClientAuthResponseSchema,
  RefreshRequestSchema,
  RefreshResponseSchema
} from '../schemas';
import type {
  TelegramLoginDto,
  AdminLoginDto,
  AdminAuthResponse,
  ClientAuthResponse,
  RefreshRequest,
  RefreshResponse
} from '../types';

/**
 * API-клиент аутентификации.
 * Админ-панель использует вход по email/паролю через /auth/admin/login.
 */
export const authClient = {
  /**
   * Вход через Telegram initData (для клиентов, не админов).
   * POST /auth/client/telegram
   */
  async loginWithTelegram(request: TelegramLoginDto): Promise<ClientAuthResponse> {
    const validatedRequest = TelegramLoginDtoSchema.parse(request);
    const response = await apiClient.post('/auth/client/telegram', validatedRequest);
    return validateResponse(response.data, ClientAuthResponseSchema);
  },

  /**
   * Вход по email и паролю (для админов).
   * POST /auth/admin/login
   */
  async loginWithCredentials(request: AdminLoginDto): Promise<AdminAuthResponse> {
    const validatedRequest = AdminLoginDtoSchema.parse(request);
    const response = await apiClient.post('/auth/admin/login', validatedRequest);
    return validateResponse(response.data, AdminAuthResponseSchema);
  },

  /**
   * @deprecated Используйте loginWithTelegram
   */
  async login(request: TelegramLoginDto): Promise<ClientAuthResponse> {
    return this.loginWithTelegram(request);
  },

  /**
   * Обновление access-токена по refresh-токену.
   * POST /auth/refresh
   */
  async refresh(request: RefreshRequest): Promise<RefreshResponse> {
    const validatedRequest = RefreshRequestSchema.parse(request);
    const response = await apiClient.post('/auth/refresh', validatedRequest);
    return validateResponse(response.data, RefreshResponseSchema);
  },

  /**
   * Выход и инвалидация refresh-токена.
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
