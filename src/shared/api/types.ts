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
export type EventStatus = z.infer<typeof schemas.EventStatusSchema>;
export type Event = z.infer<typeof schemas.EventSchema>;
export type EventCreateDto = z.infer<typeof schemas.EventCreateDtoSchema>;
export type EventUpdateDto = z.infer<typeof schemas.EventUpdateDtoSchema>;

// Session types
export type SessionStatus = z.infer<typeof schemas.SessionStatusSchema>;
export type Session = z.infer<typeof schemas.SessionSchema>;
export type SessionCompact = z.infer<typeof schemas.SessionCompactSchema>;
export type SessionCreateDto = z.infer<typeof schemas.SessionCreateDtoSchema>;
export type SessionUpdateDto = z.infer<typeof schemas.SessionUpdateDtoSchema>;
export type SessionBulkUpdateDto = z.infer<typeof schemas.SessionBulkUpdateDtoSchema>;
export type SessionBulkDeleteDto = z.infer<typeof schemas.SessionBulkDeleteDtoSchema>;
export type SessionCreationResponse = z.infer<typeof schemas.SessionCreationResponseSchema>;
export type BulkOperationFailure = z.infer<typeof schemas.BulkOperationFailureSchema>;
export type SessionBulkUpdateResponse = z.infer<typeof schemas.SessionBulkUpdateResponseSchema>;
export type SessionBulkDeleteResponse = z.infer<typeof schemas.SessionBulkDeleteResponseSchema>;

// Booking types
export type BookingStatus = z.infer<typeof schemas.BookingStatusSchema>;
export type Booking = z.infer<typeof schemas.BookingSchema>;
export type BookRequest = z.infer<typeof schemas.BookRequestSchema>;
export type PaymentInfoItem = z.infer<typeof schemas.PaymentInfoItemSchema>;
export type BookingExtended = z.infer<typeof schemas.BookingExtendedSchema>;
export type BookingCreateDto = z.infer<typeof schemas.BookingCreateDtoSchema>;
export type BookingUpdateDto = z.infer<typeof schemas.BookingUpdateDtoSchema>;
export type GuestContact = z.infer<typeof schemas.GuestContactSchema>;

// Booking with hold TTL header
export interface BookingWithHoldTTL {
  booking: Booking | BookingExtended;
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
export type BonusPaymentMethod = z.infer<typeof schemas.BonusPaymentMethodSchema>;
export type PaymentMethodRequest = z.infer<typeof schemas.PaymentMethodRequestSchema>;
// Simplified: PaymentRequest is always an array of payment methods
export type PaymentRequest = z.infer<typeof schemas.PaymentRequestSchema>;

// Composite payment method for backward compatibility
export type CompositePaymentMethodRequest = z.infer<typeof schemas.CompositePaymentMethodRequestSchema>;

// DTO types for payment requests
export type CreateBookingPaymentDto = z.infer<typeof schemas.CreateBookingPaymentDtoSchema>;
export type PurchaseSeasonTicketDto = z.infer<typeof schemas.PurchaseSeasonTicketDtoSchema>;

// Refund types
export type RefundRequest = z.infer<typeof schemas.RefundRequestSchema>;
export type Refund = z.infer<typeof schemas.RefundSchema>;

// Certificate types
export type CertificateType = z.infer<typeof schemas.CertificateTypeSchema>;
export type CertificateStatus = z.infer<typeof schemas.CertificateStatusSchema>;
export type DenominationCertData = z.infer<typeof schemas.DenominationCertDataSchema>;
export type PassesCertData = z.infer<typeof schemas.PassesCertDataSchema>;
export type Certificate = z.infer<typeof schemas.CertificateSchema>;
export type CertificateCreateDto = z.infer<typeof schemas.CertificateCreateDtoSchema>;

// Certificate Admin types
export type ClientInfo = z.infer<typeof schemas.ClientInfoSchema>;
export type CertificateAdmin = z.infer<typeof schemas.CertificateAdminSchema>;
export type CertificateAdminPaginatedResponse = z.infer<typeof schemas.CertificateAdminPaginatedResponseSchema>;
export type CertificateSortField = z.infer<typeof schemas.CertificateSortFieldSchema>;
export type SortCriterion = z.infer<typeof schemas.SortCriterionSchema>;
export type CertificateAdminFilters = z.infer<typeof schemas.CertificateAdminFiltersSchema>;
export type AdminCreateCertificateDto = z.infer<typeof schemas.AdminCreateCertificateDtoSchema>;
export type AdminUpdateCertificateDto = z.infer<typeof schemas.AdminUpdateCertificateDtoSchema>;

// Season ticket types
export type SeasonTicketMatchMode = z.infer<typeof schemas.SeasonTicketMatchModeSchema>;
export type EventFilterLabels = z.infer<typeof schemas.EventFilterLabelsSchema>;
export type EventFilterAttributes = z.infer<typeof schemas.EventFilterAttributesSchema>;
export type EventFilter = z.infer<typeof schemas.EventFilterSchema>;
export type SeasonTicketPlan = z.infer<typeof schemas.SeasonTicketPlanSchema>;
export type SeasonTicketPlanCreateDto = z.infer<typeof schemas.SeasonTicketPlanCreateDtoSchema>;
export type SeasonTicketPlanUpdateDto = z.infer<typeof schemas.SeasonTicketPlanUpdateDtoSchema>;
export type SeasonTicketStatus = z.infer<typeof schemas.SeasonTicketStatusSchema>;
export type SeasonTicket = z.infer<typeof schemas.SeasonTicketSchema>;
export type AdminGrantSeasonTicketDto = z.infer<typeof schemas.AdminGrantSeasonTicketDtoSchema>;

// Bonus types
export type BonusTransactionType = z.infer<typeof schemas.BonusTransactionTypeSchema>;
export type BonusTransaction = z.infer<typeof schemas.BonusTransactionSchema>;
export type BonusWallet = z.infer<typeof schemas.BonusWalletSchema>;
export type BonusRules = z.infer<typeof schemas.BonusRulesSchema>;
export type BonusOperationStatus = z.infer<typeof schemas.BonusOperationStatusSchema>;
export type BonusOperationDto = z.infer<typeof schemas.BonusOperationDtoSchema>;
export type AdminAdjustBonusDto = z.infer<typeof schemas.AdminAdjustBonusDtoSchema>;

// Waitlist types
export type WaitlistEntry = z.infer<typeof schemas.WaitlistEntrySchema>;

// Admin types
export type AuditLog = z.infer<typeof schemas.AuditLogSchema>;
export type JobExecutionResult = z.infer<typeof schemas.JobExecutionResultSchema>;

// Auth types
export type TelegramLoginDto = z.infer<typeof schemas.TelegramLoginDtoSchema>;
export type AdminLoginDto = z.infer<typeof schemas.AdminLoginDtoSchema>;
export type LoginDto = z.infer<typeof schemas.LoginDtoSchema>; // Alias for AdminLoginDto

// Admin types
export type Admin = z.infer<typeof schemas.AdminSchema>;
export type AdminCreateDto = z.infer<typeof schemas.AdminCreateDtoSchema>;
export type AdminUpdateDto = z.infer<typeof schemas.AdminUpdateDtoSchema>;
export type AdminSelfUpdateDto = z.infer<typeof schemas.AdminSelfUpdateDtoSchema>;
export type ChangePasswordDto = z.infer<typeof schemas.ChangePasswordDtoSchema>;
export type AdminFilters = z.infer<typeof schemas.AdminFiltersSchema>;

// Client types (Telegram users)
export type Client = z.infer<typeof schemas.ClientSchema>;
export type ClientSeasonTicketSummary = z.infer<typeof schemas.ClientSeasonTicketSummarySchema>;
export type ClientUpdateDto = z.infer<typeof schemas.ClientUpdateDtoSchema>;
export type ClientFilters = z.infer<typeof schemas.ClientFiltersSchema>;

// Auth response types
export type AdminAuthResponse = z.infer<typeof schemas.AdminAuthResponseSchema>;
export type ClientAuthResponse = z.infer<typeof schemas.ClientAuthResponseSchema>;
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
export type ImageFilters = z.infer<typeof schemas.ImageFiltersSchema>;

// Image types
export type Image = z.infer<typeof schemas.ImageSchema>;

// Content types
export type Content = z.infer<typeof schemas.ContentSchema>;
export type ContentFilters = z.infer<typeof schemas.ContentFiltersSchema>;
export type ContentCreate = z.infer<typeof schemas.ContentCreateSchema>;
export type ContentUpdate = z.infer<typeof schemas.ContentUpdateSchema>;

// Notification Template types
export type NotificationTemplateType = z.infer<typeof schemas.NotificationTemplateTypeSchema>;
export type NotificationTemplate = z.infer<typeof schemas.NotificationTemplateSchema>;
export type NotificationTemplateUpdate = z.infer<typeof schemas.NotificationTemplateUpdateSchema>;

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

// Authentication context types - Admin panel uses Admin, not User
export interface AuthState {
  admin: Admin | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Legacy alias for backward compatibility during migration
export interface LegacyAuthState {
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

// ========================================
// Page-Based Pagination Types for Admin
// ========================================

// Generic page-based pagination response type
export interface PageBasedPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Client Admin sort types
export type ClientSortField = z.infer<typeof schemas.ClientSortFieldSchema>;
export type ClientAdminSortCriterion = z.infer<typeof schemas.ClientAdminSortCriterionSchema>;

// Event Admin sort types
export type EventSortField = z.infer<typeof schemas.EventSortFieldSchema>;
export type EventAdminSortCriterion = z.infer<typeof schemas.EventAdminSortCriterionSchema>;

// Session Admin sort types
export type SessionSortField = z.infer<typeof schemas.SessionSortFieldSchema>;
export type SessionAdminSortCriterion = z.infer<typeof schemas.SessionAdminSortCriterionSchema>;

// Admin entity filter types
export type ClientAdminFilters = z.infer<typeof schemas.ClientAdminFiltersSchema>;
export type EventAdminFilters = z.infer<typeof schemas.EventAdminFiltersSchema>;
export type SessionAdminFilters = z.infer<typeof schemas.SessionAdminFiltersSchema>;
export type SeasonTicketPlanAdminFilters = z.infer<typeof schemas.SeasonTicketPlanAdminFiltersSchema>;

// Admin entity paginated response types
export type ClientAdminPaginatedResponse = z.infer<typeof schemas.ClientAdminPaginatedResponseSchema>;
export type EventAdminPaginatedResponse = z.infer<typeof schemas.EventAdminPaginatedResponseSchema>;
export type SessionAdminPaginatedResponse = z.infer<typeof schemas.SessionAdminPaginatedResponseSchema>;
export type SeasonTicketPlanAdminPaginatedResponse = z.infer<typeof schemas.SeasonTicketPlanAdminPaginatedResponseSchema>;

// Season Ticket Admin types
export type SeasonTicketSortField = z.infer<typeof schemas.SeasonTicketSortFieldSchema>;
export type SeasonTicketAdminSortCriterion = z.infer<typeof schemas.SeasonTicketAdminSortCriterionSchema>;
export type SeasonTicketAdminFilters = z.infer<typeof schemas.SeasonTicketAdminFiltersSchema>;
export type SeasonTicketOwnerInfo = z.infer<typeof schemas.SeasonTicketOwnerInfoSchema>;
export type SeasonTicketPlanInfo = z.infer<typeof schemas.SeasonTicketPlanInfoSchema>;
export type SeasonTicketAdmin = z.infer<typeof schemas.SeasonTicketAdminSchema>;
export type SeasonTicketAdminPaginatedResponse = z.infer<typeof schemas.SeasonTicketAdminPaginatedResponseSchema>;