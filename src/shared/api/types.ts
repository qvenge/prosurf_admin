import type { z } from 'zod';
import * as schemas from './schemas';

// Base types
export type ApiError = z.infer<typeof schemas.ErrorSchema>;
export type Price = z.infer<typeof schemas.PriceSchema>;

// User types
export type Role = z.infer<typeof schemas.RoleSchema>;
export type User = z.infer<typeof schemas.UserSchema>;
export type UserUpdateDto = z.infer<typeof schemas.UserUpdateDtoSchema>;

// Event types
export type EventDescription = z.infer<typeof schemas.EventDescriptionSchema>;
export type TicketPrice = z.infer<typeof schemas.TicketPriceSchema>;
export type AttributeValue = z.infer<typeof schemas.AttributeValueSchema>;
export type EventTicket = z.infer<typeof schemas.EventTicketSchema>;
export type EventTicketCreate = z.infer<typeof schemas.EventTicketCreateSchema>;
export type Event = z.infer<typeof schemas.EventSchema>;
export type EventCreateDto = z.infer<typeof schemas.EventCreateDtoSchema>;

// Session types
export type SessionStatus = z.infer<typeof schemas.SessionStatusSchema>;
export type Session = z.infer<typeof schemas.SessionSchema>;
export type SessionCreateDto = z.infer<typeof schemas.SessionCreateDtoSchema>;
export type SessionUpdateDto = z.infer<typeof schemas.SessionUpdateDtoSchema>;
export type SessionCreationResponse = z.infer<typeof schemas.SessionCreationResponseSchema>;

// Booking types
export type BookingStatus = z.infer<typeof schemas.BookingStatusSchema>;
export type Booking = z.infer<typeof schemas.BookingSchema>;
export type BookRequest = z.infer<typeof schemas.BookRequestSchema>;

// Booking with hold TTL header
export interface BookingWithHoldTTL {
  booking: Booking;
  holdTtlSeconds: number | null;
}

// Payment types
export type PaymentStatus = z.infer<typeof schemas.PaymentStatusSchema>;
export type PaymentNextActionOpenInvoice = z.infer<typeof schemas.PaymentNextActionOpenInvoiceSchema>;
export type PaymentNextActionRedirect = z.infer<typeof schemas.PaymentNextActionRedirectSchema>;
export type PaymentNextActionNone = z.infer<typeof schemas.PaymentNextActionNoneSchema>;
export type PaymentNextAction = z.infer<typeof schemas.PaymentNextActionSchema>;
export type Payment = z.infer<typeof schemas.PaymentSchema>;

// Payment method types
export type CardPaymentMethod = z.infer<typeof schemas.CardPaymentMethodSchema>;
export type CertificatePaymentMethod = z.infer<typeof schemas.CertificatePaymentMethodSchema>;
export type SeasonTicketPaymentMethod = z.infer<typeof schemas.SeasonTicketPaymentMethodSchema>;
export type CashbackPaymentMethod = z.infer<typeof schemas.CashbackPaymentMethodSchema>;
export type PaymentMethodRequest = z.infer<typeof schemas.PaymentMethodRequestSchema>;
export type CompositePaymentMethodRequest = z.infer<typeof schemas.CompositePaymentMethodRequestSchema>;
export type PaymentRequest = z.infer<typeof schemas.PaymentRequestSchema>;

// Refund types
export type RefundRequest = z.infer<typeof schemas.RefundRequestSchema>;
export type Refund = z.infer<typeof schemas.RefundSchema>;

// Certificate types
export type CertificateType = z.infer<typeof schemas.CertificateTypeSchema>;
export type DenominationCertData = z.infer<typeof schemas.DenominationCertDataSchema>;
export type PassesCertData = z.infer<typeof schemas.PassesCertDataSchema>;
export type Certificate = z.infer<typeof schemas.CertificateSchema>;
export type CertificateCreateDto = z.infer<typeof schemas.CertificateCreateDtoSchema>;

// Season ticket types
export type SeasonTicketPlan = z.infer<typeof schemas.SeasonTicketPlanSchema>;
export type SeasonTicketPlanCreateDto = z.infer<typeof schemas.SeasonTicketPlanCreateDtoSchema>;
export type SeasonTicketPlanUpdateDto = z.infer<typeof schemas.SeasonTicketPlanUpdateDtoSchema>;
export type SeasonTicketStatus = z.infer<typeof schemas.SeasonTicketStatusSchema>;
export type SeasonTicket = z.infer<typeof schemas.SeasonTicketSchema>;

// Cashback types
export type CashbackTransactionType = z.infer<typeof schemas.CashbackTransactionTypeSchema>;
export type CashbackTransaction = z.infer<typeof schemas.CashbackTransactionSchema>;
export type CashbackWallet = z.infer<typeof schemas.CashbackWalletSchema>;
export type CashbackRules = z.infer<typeof schemas.CashbackRulesSchema>;

// Waitlist types
export type WaitlistEntry = z.infer<typeof schemas.WaitlistEntrySchema>;

// Admin types
export type AuditLog = z.infer<typeof schemas.AuditLogSchema>;
export type JobExecutionResult = z.infer<typeof schemas.JobExecutionResultSchema>;

// Auth types
export type TelegramLoginDto = z.infer<typeof schemas.TelegramLoginDtoSchema>;
export type LoginDto = z.infer<typeof schemas.LoginDtoSchema>;
export type RegisterDto = z.infer<typeof schemas.RegisterDtoSchema>;
export type AuthResponse = z.infer<typeof schemas.AuthResponseSchema>;

// Legacy types for backward compatibility
export type LoginRequest = z.infer<typeof schemas.LoginRequestSchema>;
export type LoginResponse = z.infer<typeof schemas.LoginResponseSchema>;
export type RefreshRequest = z.infer<typeof schemas.RefreshRequestSchema>;
export type RefreshResponse = z.infer<typeof schemas.RefreshResponseSchema>;

// Telegram webhook types
export type TelegramUser = z.infer<typeof schemas.TelegramUserSchema>;
export type SuccessfulPayment = z.infer<typeof schemas.SuccessfulPaymentSchema>;
export type Message = z.infer<typeof schemas.MessageSchema>;
export type OrderInfo = z.infer<typeof schemas.OrderInfoSchema>;
export type PreCheckoutQuery = z.infer<typeof schemas.PreCheckoutQuerySchema>;
export type TelegramUpdate = z.infer<typeof schemas.TelegramUpdateSchema>;

// Paginated response types
export type PaginatedResponse<T> = {
  items: T[];
  next: string | null;
};

// Filter types
export type EventFilters = z.infer<typeof schemas.EventFiltersSchema>;
export type SessionFilters = z.infer<typeof schemas.SessionFiltersSchema>;
export type BookingFilters = z.infer<typeof schemas.BookingFiltersSchema>;
export type UserFilters = z.infer<typeof schemas.UserFiltersSchema>;
export type CertificateFilters = z.infer<typeof schemas.CertificateFiltersSchema>;
export type SeasonTicketFilters = z.infer<typeof schemas.SeasonTicketFiltersSchema>;
export type WaitlistFilters = z.infer<typeof schemas.WaitlistFiltersSchema>;
export type AuditLogFilters = z.infer<typeof schemas.AuditLogFiltersSchema>;
export type SeasonTicketPlanFilters = z.infer<typeof schemas.SeasonTicketPlanFiltersSchema>;

// Common parameter types
export type CursorParam = z.infer<typeof schemas.CursorParamSchema>;
export type LimitParam = z.infer<typeof schemas.LimitParamSchema>;
export type StartsAfterParam = z.infer<typeof schemas.StartsAfterParamSchema>;
export type EndsBeforeParam = z.infer<typeof schemas.EndsBeforeParamSchema>;
export type IdempotencyKey = z.infer<typeof schemas.IdempotencyKeySchema>;

// HTTP response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiErrorResponse {
  error: ApiError;
  status: number;
  statusText: string;
}

// Authentication context types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Query key factory types
export interface QueryKeyFactory {
  all: readonly string[];
  lists: () => readonly string[];
  list: (filters?: Record<string, unknown>) => readonly string[];
  details: () => readonly string[];
  detail: (id: string) => readonly string[];
}