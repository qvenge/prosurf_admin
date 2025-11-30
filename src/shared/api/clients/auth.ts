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
 * Authentication API client
 *
 * Provides methods for admin authentication.
 * Admin panel uses email/password login via /auth/admin/login
 */
export const authClient = {
  /**
   * Login with Telegram init data (for clients, not admins)
   * POST /auth/client/telegram
   *
   * @param request - Telegram login request with initData
   * @returns Promise resolving to auth response with tokens and client data
   */
  async loginWithTelegram(request: TelegramLoginDto): Promise<ClientAuthResponse> {
    const validatedRequest = TelegramLoginDtoSchema.parse(request);
    const response = await apiClient.post('/auth/client/telegram', validatedRequest);
    return validateResponse(response.data, ClientAuthResponseSchema);
  },

  /**
   * Login with email and password (admin login)
   * POST /auth/admin/login
   *
   * @param request - Login request with email and password
   * @returns Promise resolving to auth response with tokens and admin data
   * @example
   * ```ts
   * const response = await authClient.loginWithCredentials({
   *   email: 'admin@example.com',
   *   password: 'password123'
   * });
   * console.log(response.admin.id);
   * ```
   */
  async loginWithCredentials(request: AdminLoginDto): Promise<AdminAuthResponse> {
    const validatedRequest = AdminLoginDtoSchema.parse(request);
    const response = await apiClient.post('/auth/admin/login', validatedRequest);
    return validateResponse(response.data, AdminAuthResponseSchema);
  },

  /**
   * Legacy login method for backward compatibility
   * @deprecated Use loginWithTelegram instead
   */
  async login(request: TelegramLoginDto): Promise<ClientAuthResponse> {
    return this.loginWithTelegram(request);
  },

  /**
   * Refresh access token using refresh token
   * POST /auth/refresh
   *
   * @param request - Refresh request with current refresh token
   * @returns Promise resolving to new access and refresh tokens
   */
  async refresh(request: RefreshRequest): Promise<RefreshResponse> {
    const validatedRequest = RefreshRequestSchema.parse(request);
    const response = await apiClient.post('/auth/refresh', validatedRequest);
    return validateResponse(response.data, RefreshResponseSchema);
  },

  /**
   * Logout and invalidate refresh token
   * POST /auth/logout
   *
   * Invalidates the current refresh token on the server.
   * Client should clear local tokens after this call.
   *
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
