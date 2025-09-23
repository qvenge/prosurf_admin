import { z } from 'zod';

// Base schemas
export const ErrorSchema = z.object({
  code: z.enum([
    'AMOUNT_MISMATCH',
    'DUPLICATE_PAYMENT',
    'HOLD_EXPIRED',
    'NO_SEATS',
    'PROVIDER_UNAVAILABLE',
    'INVALID_CREDENTIALS',
    'USER_EXISTS',
    'WEAK_PASSWORD',
    'INVALID_EMAIL',
  ]),
  message: z.string(),
  details: z.unknown().nullable(),
});

export const PriceSchema = z.object({
  currency: z.string(),
  amountMinor: z.number().int(),
});

// User schemas
export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const UserSchema = z.object({
  id: z.string(),
  telegramId: z.number().int().nullable(),
  phone: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  username: z.string().nullable(),
  email: z.string().nullable(),
  photoUrl: z.string().nullable(),
  role: RoleSchema,
  createdAt: z.string().datetime(),
  authMethod: z.enum(['telegram', 'email', 'username']),
});

export const UserUpdateDtoSchema = z.object({
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
});

// Guest contact schema
export const GuestContactSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{7,15}$/),
  firstName: z.string().max(128).nullable().optional(),
  lastName: z.string().max(128).nullable().optional(),
  email: z.string().email().nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

// Event schemas
export const EventDescriptionSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

export const TicketPriceSchema = z.object({
  price: PriceSchema,
  description: z.string().nullable().optional(),
});

export const EventTicketSchema = z.object({
  id: z.string(),
  name: z.string(),
  prepayment: TicketPriceSchema.nullable(),
  full: TicketPriceSchema,
});

export const EventTicketCreateSchema = z.object({
  name: z.string(),
  prepayment: TicketPriceSchema,
  full: TicketPriceSchema,
});

// Attribute value can be string, number, integer, boolean, or array of strings
export const AttributeValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
]);

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.array(EventDescriptionSchema).nullable().optional(),
  location: z.string().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  tickets: z.array(EventTicketSchema),
  createdAt: z.string().datetime(),
  labels: z.array(z.string()).optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
});

export const EventCreateDtoSchema = z.object({
  title: z.string(),
  description: z.array(EventDescriptionSchema).nullable().optional(),
  location: z.string().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  tickets: z.array(EventTicketCreateSchema),
  labels: z.array(z.string()).optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
});

// Session schemas
export const SessionStatusSchema = z.enum(['SCHEDULED', 'CANCELLED']);

export const SessionSchema = z.object({
  id: z.string(),
  event: EventSchema,
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  remainingSeats: z.number().int().min(0),
  hasBooking: z.boolean().optional(),
  onWaitlist: z.boolean().optional(),
  status: SessionStatusSchema.optional(),
  labels: z.array(z.string()).nullable().optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
  effectiveLabels: z.array(z.string()).optional(),
  effectiveAttributes: z.record(z.string(), AttributeValueSchema).optional(),
  createdAt: z.string().datetime().optional(),
});

// SessionCompact schema for API responses that don't include the full event object
export const SessionCompactSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  remainingSeats: z.number().int().min(0),
  hasBooking: z.boolean().optional(),
  onWaitlist: z.boolean().optional(),
  status: SessionStatusSchema.optional(),
  labels: z.array(z.string()).nullable().optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
  effectiveLabels: z.array(z.string()).optional(),
  effectiveAttributes: z.record(z.string(), AttributeValueSchema).optional(),
  createdAt: z.string().datetime().optional(),
});

export const SessionCreateDtoSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  labels: z.array(z.string()).optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
});

export const SessionUpdateDtoSchema = z.object({
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(0).optional(),
  labels: z.array(z.string()).optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
});

export const SessionCreationResponseSchema = z.object({
  items: z.array(SessionCompactSchema),
});

// Booking schemas
export const BookingStatusSchema = z.enum(['HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED']);

export const BookingSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  userId: z.string().nullable(),
  quantity: z.number().int().min(1),
  status: BookingStatusSchema,
  hold: z.object({
    expiresAt: z.string().datetime(),
  }).nullable(),
  totalPrice: PriceSchema,
  guestContact: GuestContactSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  createdBy: z.string().nullable().optional(),
});

export const BookRequestSchema = z.object({
  quantity: z.number().int().min(1),
});

export const BookingExtendedSchema = BookingSchema.extend({
  user: UserSchema.optional(),
  guestContact: GuestContactSchema.nullable().optional(),
  session: z.lazy(() => SessionSchema).optional(),
  paymentInfo: z.union([
    z.object({
      method: z.enum(['card', 'certificate', 'pass', 'cashback', 'composite']),
      paymentId: z.string().nullable().optional(),
      certificateId: z.string().nullable().optional(),
      seasonTicketId: z.string().nullable().optional(),
    }),
    z.array(z.unknown()),
  ]).nullable().optional(),
});

export const BookingCreateDtoSchema = z.object({
  quantity: z.number().int().min(1),
  userId: z.string().nullable().optional(),
  guestContact: GuestContactSchema.nullable().optional(),
  status: z.enum(['HOLD', 'CONFIRMED']).default('HOLD').optional(),
  ticketId: z.string().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export const BookingUpdateDtoSchema = z.object({
  quantity: z.number().int().min(1).optional(),
  guestContact: GuestContactSchema.optional(),
  notes: z.string().max(1000).optional(),
});

// Payment schemas
export const PaymentStatusSchema = z.enum(['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED']);

export const PaymentNextActionOpenInvoiceSchema = z.object({
  type: z.literal('openInvoice'),
  slugOrUrl: z.string(),
});

export const PaymentNextActionRedirectSchema = z.object({
  type: z.literal('redirect'),
  url: z.string().url(),
});

export const PaymentNextActionNoneSchema = z.object({
  type: z.literal('none'),
});

export const PaymentNextActionSchema = z.union([
  PaymentNextActionOpenInvoiceSchema,
  PaymentNextActionRedirectSchema,
  PaymentNextActionNoneSchema,
]);

export const PaymentSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  amount: PriceSchema,
  status: PaymentStatusSchema,
  createdAt: z.string().datetime(),
  provider: z.enum(['telegram', 'stripe', 'yookassa', 'cloudpayments', 'other']).optional(),
  providerPaymentId: z.string().nullable().optional(),
  providerChargeId: z.string().nullable().optional(),
  nextAction: PaymentNextActionSchema.optional(),
});

// Payment method schemas
export const CardPaymentMethodSchema = z.object({
  method: z.literal('card'),
  provider: z.enum(['telegram', 'stripe', 'yookassa', 'cloudpayments']).optional(),
  returnUrl: z.string().url().optional(),
});

export const CertificatePaymentMethodSchema = z.object({
  method: z.literal('certificate'),
  certificateId: z.string(),
});

export const SeasonTicketPaymentMethodSchema = z.object({
  method: z.literal('pass'),
  seasonTicketId: z.string(),
  passesToSpend: z.number().int().min(1),
});

export const CashbackPaymentMethodSchema = z.object({
  method: z.literal('cashback'),
  amount: PriceSchema,
});

export const PaymentMethodRequestSchema = z.discriminatedUnion('method', [
  CardPaymentMethodSchema,
  CertificatePaymentMethodSchema,
  SeasonTicketPaymentMethodSchema,
  CashbackPaymentMethodSchema,
]);

export const CompositePaymentMethodRequestSchema = z.object({
  methods: z.array(PaymentMethodRequestSchema).min(1),
});

export const PaymentRequestSchema = z.union([
  PaymentMethodRequestSchema,
  CompositePaymentMethodRequestSchema,
]);

// Refund schemas
export const RefundRequestSchema = z.object({
  amount: PriceSchema.optional(),
  reason: z.string().max(256).optional(),
});

export const RefundSchema = z.object({
  id: z.string(),
  paymentId: z.string(),
  amount: PriceSchema,
  createdAt: z.string().datetime(),
});

// Certificate schemas
export const CertificateTypeSchema = z.enum(['denomination', 'passes']);

export const DenominationCertDataSchema = z.object({
  amount: PriceSchema,
});

export const PassesCertDataSchema = z.object({
  passes: z.number().int().min(1),
});

// Note: This schema is defined but not directly used, as we use the union directly in CertificateSchema
// Keeping it for potential future use
// const CertificateDataSchema = z.discriminatedUnion('type', [
//   z.object({ type: z.literal('denomination'), amount: PriceSchema }),
//   z.object({ type: z.literal('passes'), passes: z.number().int().min(1) }),
// ]);

export const CertificateSchema = z.object({
  id: z.string(),
  type: CertificateTypeSchema,
  data: z.union([
    DenominationCertDataSchema,
    PassesCertDataSchema,
  ]),
  expiresAt: z.string().datetime().nullable().optional(),
  ownerUserId: z.string().optional(),
});

export const CertificateCreateDtoSchema = z.object({
  type: CertificateTypeSchema,
  data: z.union([
    DenominationCertDataSchema,
    PassesCertDataSchema,
  ]),
  expiresAt: z.string().datetime().nullable().optional(),
  ownerUserId: z.string(),
});

// Season ticket schemas
export const SeasonTicketPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: PriceSchema,
  passes: z.number().int().min(1),
  eventIds: z.array(z.string()).optional(),
});

export const SeasonTicketPlanCreateDtoSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  price: PriceSchema,
  passes: z.number().int().min(1),
  eventIds: z.array(z.string()).optional(),
});

export const SeasonTicketPlanUpdateDtoSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  price: PriceSchema.optional(),
  passes: z.number().int().min(1).optional(),
  eventIds: z.array(z.string()).optional(),
});

export const SeasonTicketStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']);

export const SeasonTicketSchema = z.object({
  id: z.string(),
  planId: z.string(),
  userId: z.string(),
  status: SeasonTicketStatusSchema,
  remainingPasses: z.number().int().min(0),
  validUntil: z.string().datetime().nullable(),
});

// Cashback schemas
export const CashbackTransactionTypeSchema = z.enum(['EARN', 'REDEEM', 'ADJUST']);

export const CashbackTransactionSchema = z.object({
  id: z.string(),
  type: CashbackTransactionTypeSchema,
  amount: PriceSchema,
  createdAt: z.string().datetime(),
  note: z.string().nullable().optional(),
});

export const CashbackWalletSchema = z.object({
  balance: PriceSchema,
  history: z.array(CashbackTransactionSchema).optional(),
});

export const CashbackRulesSchema = z.object({
  earnRates: z.array(z.object({
    product: z.enum(['single', 'certificate', 'seasonTicket']),
    rate: z.number().min(0).max(1),
  })),
  maxRedeemRate: z.number().min(0).max(1),
});

// Waitlist schemas
export const WaitlistEntrySchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  userId: z.string(),
  createdAt: z.string().datetime(),
  position: z.number().int().min(1),
});

// Admin schemas
export const AuditLogSchema = z.object({
  id: z.string(),
  ts: z.string().datetime(),
  actorUserId: z.string(),
  action: z.string(),
  subjectType: z.string(),
  subjectId: z.string(),
});

export const JobExecutionResultSchema = z.object({
  expired: z.number().int(),
});

// Auth schemas
export const TelegramLoginDtoSchema = z.object({
  initData: z.string(),
});

export const LoginDtoSchema = z.object({
  login: z.string(),
  password: z.string().min(6),
});

export const RegisterDtoSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().regex(/^[a-zA-Z0-9_-]{3,32}$/).optional(),
  password: z.string().min(6),
  firstName: z.string().max(128).optional(),
  lastName: z.string().max(128).optional(),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/).optional(),
  role: RoleSchema.optional(),
}).refine(data => data.email || data.username, {
  message: "Either email or username must be provided",
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
});

// Legacy schemas for backward compatibility
export const LoginRequestSchema = TelegramLoginDtoSchema;
export const LoginResponseSchema = AuthResponseSchema;

export const RefreshRequestSchema = z.object({
  refreshToken: z.string(),
});

export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// Telegram webhook schemas
export const TelegramUserSchema = z.object({
  id: z.number().int(),
  is_bot: z.boolean(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
});

export const SuccessfulPaymentSchema = z.object({
  currency: z.string(),
  total_amount: z.number().int(),
  invoice_payload: z.string(),
  telegram_payment_charge_id: z.string(),
  provider_payment_charge_id: z.string(),
});

export const MessageSchema = z.object({
  message_id: z.number().int(),
  from: TelegramUserSchema,
  date: z.number().int(),
  chat: z.object({}).passthrough(),
  successful_payment: SuccessfulPaymentSchema.optional(),
});

export const OrderInfoSchema = z.object({}).passthrough();

export const PreCheckoutQuerySchema = z.object({
  id: z.string(),
  from: TelegramUserSchema,
  currency: z.string(),
  total_amount: z.number().int(),
  invoice_payload: z.string(),
  shipping_option_id: z.string().optional(),
  order_info: OrderInfoSchema.optional(),
});

export const TelegramUpdateSchema = z.object({
  update_id: z.number().int(),
  pre_checkout_query: PreCheckoutQuerySchema.optional(),
  message: MessageSchema.optional(),
}).passthrough();

// Paginated response schemas
export const PaginatedResponseSchema = <T>(itemSchema: z.ZodSchema<T>) => z.object({
  items: z.array(itemSchema),
  next: z.string().nullable(),
});

// Common parameters
export const CursorParamSchema = z.string().optional();
export const LimitParamSchema = z.number().int().min(1).max(200).default(20).optional();
export const StartsAfterParamSchema = z.string().datetime().optional();
export const EndsBeforeParamSchema = z.string().datetime().optional();
export const IdempotencyKeySchema = z.string().min(8).max(128);

// Filter schemas for different endpoints
export const EventFiltersSchema = z.object({
  q: z.string().optional(),
  startsAfter: StartsAfterParamSchema,
  endsBefore: EndsBeforeParamSchema,
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
  'labels.any': z.array(z.string()).optional(),
  'labels.all': z.array(z.string()).optional(),
  'labels.none': z.array(z.string()).optional(),
  'attr.eq': z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  'attr.in': z.record(z.string(), z.array(z.union([z.string(), z.number()]))).optional(),
  'attr.gte': z.record(z.string(), z.number()).optional(),
  'attr.lte': z.record(z.string(), z.number()).optional(),
  'attr.bool': z.record(z.string(), z.boolean()).optional(),
  'attr.exists': z.record(z.string(), z.boolean()).optional(),
});

export const SessionFiltersSchema = z.object({
  eventId: z.string().optional(),
  startsAfter: StartsAfterParamSchema,
  endsBefore: EndsBeforeParamSchema,
  minRemainingSeats: z.number().int().min(0).optional(),
  sortBy: z.enum(['createdAt', 'startsAt']).default('startsAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
  'labels.any': z.array(z.string()).optional(),
  'labels.all': z.array(z.string()).optional(),
  'labels.none': z.array(z.string()).optional(),
  'attr.eq': z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  'attr.in': z.record(z.string(), z.array(z.union([z.string(), z.number()]))).optional(),
  'attr.gte': z.record(z.string(), z.number()).optional(),
  'attr.lte': z.record(z.string(), z.number()).optional(),
  'attr.bool': z.record(z.string(), z.boolean()).optional(),
  'attr.exists': z.record(z.string(), z.boolean()).optional(),
});

export const BookingFiltersSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  status: z.enum(['HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED']).optional(),
  bookingType: z.enum(['registered', 'guest', 'all']).default('all').optional(),
  includeUser: z.boolean().default(false).optional(),
  includeSession: z.boolean().default(false).optional(),
  includePaymentInfo: z.boolean().default(false).optional(),
  includeGuestContact: z.boolean().default(false).optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const UserFiltersSchema = z.object({
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const CertificateFiltersSchema = z.object({
  userId: z.string().optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const SeasonTicketFiltersSchema = z.object({
  userId: z.string().optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const WaitlistFiltersSchema = z.object({
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const AuditLogFiltersSchema = z.object({
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const SeasonTicketPlanFiltersSchema = z.object({
  eventIds: z.array(z.string()).optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});