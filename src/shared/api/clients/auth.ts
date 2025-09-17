import { apiClient, validateResponse } from '../config';
import {
  TelegramLoginDtoSchema,
  LoginDtoSchema,
  RegisterDtoSchema,
  AuthResponseSchema,
  RefreshRequestSchema,
  RefreshResponseSchema
} from '../schemas';
import type {
  TelegramLoginDto,
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshRequest,
  RefreshResponse
} from '../types';

/**
 * Authentication API client
 * 
 * Provides methods for user authentication including login, token refresh, and logout.
 * Uses Telegram WebApp initData for authentication.
 */
export const authClient = {
  /**
   * Login with Telegram init data
   * POST /auth/telegram
   *
   * @param request - Telegram login request with initData
   * @returns Promise resolving to auth response with tokens and user data
   * @example
   * ```ts
   * const response = await authClient.loginWithTelegram({
   *   initData: 'telegram_init_data_string'
   * });
   * console.log(response.user.id);
   * ```
   */
  async loginWithTelegram(request: TelegramLoginDto): Promise<AuthResponse> {
    const validatedRequest = TelegramLoginDtoSchema.parse(request);
    const response = await apiClient.post('/auth/telegram', validatedRequest);
    return validateResponse(response.data, AuthResponseSchema);
  },

  /**
   * Login with email/username and password
   * POST /auth/login
   *
   * @param request - Login request with email/username and password
   * @returns Promise resolving to auth response with tokens and user data
   * @example
   * ```ts
   * const response = await authClient.loginWithCredentials({
   *   login: 'user@example.com',
   *   password: 'password123'
   * });
   * console.log(response.user.id);
   * ```
   */
  async loginWithCredentials(request: LoginDto): Promise<AuthResponse> {
    const validatedRequest = LoginDtoSchema.parse(request);
    const response = await apiClient.post('/auth/login', validatedRequest);
    return validateResponse(response.data, AuthResponseSchema);
  },

  /**
   * Register a new user
   * POST /auth/register
   *
   * @param request - Registration request with user details
   * @returns Promise resolving to auth response with tokens and user data
   * @example
   * ```ts
   * const response = await authClient.register({
   *   email: 'newuser@example.com',
   *   password: 'password123',
   *   firstName: 'John',
   *   lastName: 'Doe'
   * });
   * console.log(response.user.id);
   * ```
   */
  async register(request: RegisterDto): Promise<AuthResponse> {
    const validatedRequest = RegisterDtoSchema.parse(request);
    const response = await apiClient.post('/auth/register', validatedRequest);
    return validateResponse(response.data, AuthResponseSchema);
  },

  /**
   * Legacy login method for backward compatibility
   * @deprecated Use loginWithTelegram instead
   */
  async login(request: TelegramLoginDto): Promise<AuthResponse> {
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