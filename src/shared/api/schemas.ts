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
    'HAS_ACTIVE_BOOKINGS',
    'HAS_ACTIVE_SESSIONS',
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
  telegramId: z.string().nullable(),
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

// Season ticket summary schema for client admin response
export const ClientSeasonTicketSummarySchema = z.object({
  remainingPasses: z.number().int(),
  totalPasses: z.number().int(),
  activeCount: z.number().int(),
});

// Client schema - matches server ClientDto (Telegram users)
// Note: Defined early because it's used in BookingExtendedSchema
export const ClientSchema = z.object({
  id: z.string(),
  telegramId: z.string(),
  telegramChatId: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  dateOfBirth: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  seasonTicketSummary: ClientSeasonTicketSummarySchema.optional(),
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
  description: z.string().nullable(),
});

export const EventTicketSchema = z.object({
  id: z.string(),
  name: z.string(),
  prepayment: TicketPriceSchema.nullable().optional(),
  full: TicketPriceSchema,
});

export const EventTicketCreateSchema = z.object({
  name: z.string(),
  prepayment: TicketPriceSchema.nullable().optional(),
  full: TicketPriceSchema,
});

// Attribute value can be string, number, integer, boolean, or array of strings
export const AttributeValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
]);

export const EventStatusSchema = z.enum(['ACTIVE', 'CANCELLED']);

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
  status: EventStatusSchema.optional(),
  images: z.array(z.string()).optional(),
});

export const EventCreateDtoSchema = z.object({
  title: z.string(),
  description: z.array(EventDescriptionSchema).nullable().optional(),
  location: z.string().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  tickets: z.array(EventTicketCreateSchema),
  labels: z.array(z.string()).optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
  images: z.array(z.instanceof(File)).optional(),
});

export const EventUpdateDtoSchema = z.object({
  title: z.string().optional(),
  description: z.array(EventDescriptionSchema).nullable().optional(),
  location: z.string().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  tickets: z.array(EventTicketCreateSchema).optional(),
  labels: z.array(z.string()).optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
  images: z.array(z.instanceof(File)).optional(),
  existingImages: z.array(z.string()).optional(),
});

// Session schemas
export const SessionStatusSchema = z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETE']);

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

export const SessionBulkUpdateDtoSchema = z.object({
  id: z.string(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(0).optional(),
  labels: z.array(z.string()).optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
});

export const SessionBulkDeleteDtoSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  force: z.boolean().default(false).optional(),
});

export const SessionCreationResponseSchema = z.object({
  items: z.array(SessionCompactSchema),
});

export const BulkOperationFailureSchema = z.object({
  id: z.string(),
  error: z.string(),
});

export const SessionBulkUpdateResponseSchema = z.object({
  items: z.array(SessionSchema),
  updated: z.number().int(),
  failed: z.array(BulkOperationFailureSchema),
});

export const SessionBulkDeleteResponseSchema = z.object({
  deleted: z.array(z.string()),
  failed: z.array(BulkOperationFailureSchema),
});

// Booking schemas
export const BookingStatusSchema = z.enum(['HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED']);

export const BookingSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  clientId: z.string().nullable(),
  quantity: z.number().int().min(1),
  status: BookingStatusSchema,
  hold: z.object({
    expiresAt: z.string().datetime(),
  }).nullable(),
  totalPrice: PriceSchema,
  guestContact: GuestContactSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  createdByAdminId: z.string().nullable().optional(),
  isPaid: z.boolean().default(true),
});

export const BookRequestSchema = z.object({
  quantity: z.number().int().min(1),
});

export const BookingExtendedSchema = BookingSchema.extend({
  user: ClientSchema.optional(),
  guestContact: GuestContactSchema.nullable().optional(),
  session: z.lazy(() => SessionSchema).optional(),
  paymentInfo: z.union([
    z.object({
      method: z.enum(['card', 'certificate', 'pass', 'bonus', 'composite']),
      paymentId: z.string().nullable().optional(),
      certificateId: z.string().nullable().optional(),
      seasonTicketId: z.string().nullable().optional(),
    }),
    z.array(z.unknown()),
  ]).nullable().optional(),
});

export const BookingCreateDtoSchema = z.object({
  quantity: z.number().int().min(1),
  clientId: z.string().nullable().optional(),
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

export const BonusPaymentMethodSchema = z.object({
  method: z.literal('bonus'),
  amount: z.number().int(),
});

export const PaymentMethodRequestSchema = z.discriminatedUnion('method', [
  CardPaymentMethodSchema,
  CertificatePaymentMethodSchema,
  SeasonTicketPaymentMethodSchema,
  BonusPaymentMethodSchema,
]);

// Simplified: paymentMethods is always an array (single or multiple methods)
export const PaymentRequestSchema = z
  .array(PaymentMethodRequestSchema)
  .min(1)
  .max(10);

// Composite payment method for backward compatibility
export const CompositePaymentMethodRequestSchema = z.object({
  methods: z.array(PaymentMethodRequestSchema),
});

// DTO schemas for payment requests
export const CreateBookingPaymentDtoSchema = z.object({
  paymentMethods: z.union([
    z.array(PaymentMethodRequestSchema),
    PaymentMethodRequestSchema,
    CompositePaymentMethodRequestSchema,
  ]),
});

export const PurchaseSeasonTicketDtoSchema = z.object({
  paymentMethods: z.union([
    z.array(PaymentMethodRequestSchema),
    PaymentMethodRequestSchema,
    CompositePaymentMethodRequestSchema,
  ]),
});

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
export const SeasonTicketMatchModeSchema = z.enum(['IDS_ONLY', 'FILTER_ONLY', 'ANY', 'ALL']);

export const EventFilterLabelsSchema = z.object({
  any: z.array(z.string()).optional(),
  all: z.array(z.string()).optional(),
  none: z.array(z.string()).optional(),
}).nullable().optional();

export const EventFilterAttributesSchema = z.object({
  eq: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  in: z.record(z.string(), z.array(z.union([z.string(), z.number()]))).optional(),
  gte: z.record(z.string(), z.number()).optional(),
  lte: z.record(z.string(), z.number()).optional(),
  bool: z.record(z.string(), z.boolean()).optional(),
  exists: z.record(z.string(), z.boolean()).optional(),
}).nullable().optional();

export const EventFilterSchema = z.object({
  labels: EventFilterLabelsSchema,
  attributes: EventFilterAttributesSchema,
}).nullable().optional();

export const SeasonTicketPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: PriceSchema,
  passes: z.number().int().min(1),
  expiresIn: z.number().int().min(1),
  matchMode: SeasonTicketMatchModeSchema.default('ALL').optional(),
  eventIds: z.array(z.string()).nullable().optional(),
  eventFilter: EventFilterSchema,
});

export const SeasonTicketPlanCreateDtoSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  price: PriceSchema,
  passes: z.number().int().min(1),
  expiresIn: z.number().int().min(1),
  matchMode: SeasonTicketMatchModeSchema.default('ALL').optional(),
  eventIds: z.array(z.string()).nullable().optional(),
  eventFilter: EventFilterSchema,
});

export const SeasonTicketPlanUpdateDtoSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  price: PriceSchema.optional(),
  passes: z.number().int().min(1).optional(),
  expiresIn: z.number().int().min(1).optional(),
  matchMode: SeasonTicketMatchModeSchema.optional(),
  eventIds: z.array(z.string()).nullable().optional(),
  eventFilter: EventFilterSchema,
});

export const SeasonTicketStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']);

export const SeasonTicketSchema = z.object({
  id: z.string(),
  plan: SeasonTicketPlanSchema,
  clientId: z.string(),
  status: SeasonTicketStatusSchema,
  remainingPasses: z.number().int().min(0),
  validUntil: z.string().datetime(),
  paymentId: z.string().nullable().optional(),
});

export const AdminGrantSeasonTicketDtoSchema = z.object({
  planId: z.string(),
  expiresIn: z.number().int().min(1).optional(),
});

// Bonus schemas
export const BonusTransactionTypeSchema = z.enum(['EARN', 'REDEEM', 'ADJUST']);

export const BonusTransactionSchema = z.object({
  id: z.string(),
  type: BonusTransactionTypeSchema,
  amount: z.number().int(),
  createdAt: z.string().datetime(),
  note: z.string().nullable().optional(),
});

export const BonusWalletSchema = z.object({
  balance: z.number().int(),
  history: z.array(BonusTransactionSchema).optional(),
});

export const BonusRulesSchema = z.object({
  earnRates: z.array(z.object({
    product: z.enum(['single', 'certificate', 'seasonTicket']),
    rate: z.number().min(0).max(1),
  })),
  maxRedeemRate: z.number().min(0).max(1),
});

export const BonusOperationStatusSchema = z.enum(['PENDING', 'POSTED', 'CANCELLED']);

export const BonusOperationDtoSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  type: BonusTransactionTypeSchema,
  amount: z.number().int(),
  status: BonusOperationStatusSchema,
  createdAt: z.string().datetime(),
  note: z.string().nullable().optional(),
});

export const AdminAdjustBonusDtoSchema = z.object({
  clientId: z.string(),
  amount: z.number(), // Positive to add, negative to subtract
  note: z.string().optional(),
});

// Waitlist schemas
export const WaitlistEntrySchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  clientId: z.string(),
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

// Admin login DTO - uses email field (not login)
export const AdminLoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Legacy alias for backward compatibility
export const LoginDtoSchema = AdminLoginDtoSchema;

// Admin schema - matches server AdminDto
export const AdminSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  permissions: z.array(z.string()).default([]),
  notes: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

// Client update DTO
export const ClientUpdateDtoSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{7,15}$/).nullable().optional(),
  firstName: z.string().max(128).nullable().optional(),
  lastName: z.string().max(128).nullable().optional(),
  dateOfBirth: z.string().datetime().nullable().optional(),
});

// Admin create DTO
export const AdminCreateDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().max(128).nullable().optional(),
  lastName: z.string().max(128).nullable().optional(),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/).nullable().optional(),
  department: z.string().max(128).nullable().optional(),
  permissions: z.array(z.string()).optional(),
  notes: z.string().max(1000).nullable().optional(),
});

// Admin update DTO (for updating other admins)
export const AdminUpdateDtoSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().max(128).nullable().optional(),
  lastName: z.string().max(128).nullable().optional(),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/).nullable().optional(),
  department: z.string().max(128).nullable().optional(),
  permissions: z.array(z.string()).optional(),
  notes: z.string().max(1000).nullable().optional(),
});

// Admin self-update DTO (for /admins/me)
export const AdminSelfUpdateDtoSchema = z.object({
  firstName: z.string().max(128).nullable().optional(),
  lastName: z.string().max(128).nullable().optional(),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/).nullable().optional(),
});

// Change password DTO
export const ChangePasswordDtoSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

// Admin auth response - server returns { admin: AdminDto } not { user: UserDto }
export const AdminAuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  admin: AdminSchema,
});

// Client auth response - for Telegram login
export const ClientAuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  client: ClientSchema,
});

// Generic auth response for backward compatibility
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
  clientId: z.string().optional(),
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
  clientId: z.string().optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

// Certificate Admin schemas
export const CertificateStatusSchema = z.enum(['PENDING_ACTIVATION', 'ACTIVATED', 'EXPIRED']);

export const ClientInfoSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
});

export const CertificateAdminSchema = z.object({
  id: z.string(),
  code: z.string(),
  type: CertificateTypeSchema,
  status: CertificateStatusSchema,
  data: z.union([
    DenominationCertDataSchema,
    PassesCertDataSchema,
  ]),
  purchasedBy: ClientInfoSchema.nullable().optional(),
  activatedBy: ClientInfoSchema.nullable().optional(),
  activatedAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
});

export const CertificateAdminPaginatedResponseSchema = z.object({
  items: z.array(CertificateAdminSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

// Sort criterion for multi-column sorting
export const CertificateSortFieldSchema = z.enum([
  'createdAt',
  'activatedAt',
  'expiresAt',
  'type',
  'purchasedByName',
  'activatedByName',
]);

export const SortCriterionSchema = z.object({
  field: CertificateSortFieldSchema,
  order: z.enum(['asc', 'desc']),
});

export const CertificateAdminFiltersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  type: CertificateTypeSchema.optional(),
  status: CertificateStatusSchema.optional(),
  clientSearch: z.string().optional(),
  sort: z.array(SortCriterionSchema).optional(),
});

export const AdminCreateCertificateDtoSchema = z.object({
  type: CertificateTypeSchema,
  amount: PriceSchema.optional(),
  passes: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
  purchasedByClientId: z.string().optional(),
});

export const AdminUpdateCertificateDtoSchema = z.object({
  expiresAt: z.string().datetime().optional(),
  status: CertificateStatusSchema.optional(),
});

export const SeasonTicketFiltersSchema = z.object({
  clientId: z.string().optional(),
  sessionId: z.string().optional(),
  eventId: z.string().optional(),
  status: z.array(SeasonTicketStatusSchema).optional(),
  hasRemainingPasses: z.boolean().optional(),
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
  sessionId: z.string().optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

// Client filters schema
export const ClientFiltersSchema = z.object({
  q: z.string().optional(), // Search query
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

// Admin filters schema
export const AdminFiltersSchema = z.object({
  q: z.string().optional(), // Search query
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

// Image schemas
export const ImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  objectName: z.string(),
  originalName: z.string(),
  mimetype: z.string(),
  size: z.number(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ImageFiltersSchema = z.object({
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
  q: z.string().optional(),
  mimetype: z.string().optional(),
  'tags.any': z.array(z.string()).optional(),
  'tags.all': z.array(z.string()).optional(),
  'tags.none': z.array(z.string()).optional(),
  minSize: z.number().optional(),
  maxSize: z.number().optional(),
  uploadedAfter: z.string().datetime().optional(),
  uploadedBefore: z.string().datetime().optional(),
  uploadedByAdminId: z.string().optional(),
});

// ========================================
// Page-Based Pagination Schemas for Admin
// ========================================

// Generic page-based pagination response schema
export const PageBasedPaginatedResponseSchema = <T>(itemSchema: z.ZodSchema<T>) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  });

// Admin entity list filter schemas
export const ClientAdminFiltersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
});

export const EventAdminFiltersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  status: EventStatusSchema.optional(),
  labels: z.array(z.string()).optional(),
});

export const SessionAdminFiltersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  eventId: z.string().optional(),
  status: SessionStatusSchema.optional(),
  labels: z.array(z.string()).optional(),
});

export const SeasonTicketPlanAdminFiltersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
});

// Page-based paginated response schemas for admin entities
export const ClientAdminPaginatedResponseSchema = PageBasedPaginatedResponseSchema(ClientSchema);
export const EventAdminPaginatedResponseSchema = PageBasedPaginatedResponseSchema(EventSchema);
export const SessionAdminPaginatedResponseSchema = PageBasedPaginatedResponseSchema(SessionSchema);
export const SeasonTicketPlanAdminPaginatedResponseSchema = PageBasedPaginatedResponseSchema(SeasonTicketPlanSchema);

// ========================================
// Season Ticket Admin Schemas
// ========================================

export const SeasonTicketSortFieldSchema = z.enum([
  'ownerName',
  'remainingPasses',
  'createdAt',
  'validUntil',
  'status',
]);

export const SeasonTicketAdminSortCriterionSchema = z.object({
  field: SeasonTicketSortFieldSchema,
  order: z.enum(['asc', 'desc']),
});

export const SeasonTicketAdminFiltersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  ownerSearch: z.string().optional(),
  planId: z.string().optional(),
  clientId: z.string().optional(),
  status: z.array(SeasonTicketStatusSchema).optional(),
  isExpired: z.boolean().optional(),
  hasRemainingPasses: z.boolean().optional(),
  sort: z.array(SeasonTicketAdminSortCriterionSchema).optional(),
});

export const SeasonTicketOwnerInfoSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
});

export const SeasonTicketPlanInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const SeasonTicketAdminSchema = z.object({
  id: z.string(),
  status: SeasonTicketStatusSchema,
  remainingPasses: z.number().int(),
  totalPasses: z.number().int(),
  validUntil: z.string().datetime(),
  createdAt: z.string().datetime(),
  owner: SeasonTicketOwnerInfoSchema,
  plan: SeasonTicketPlanInfoSchema,
});

export const SeasonTicketAdminPaginatedResponseSchema = z.object({
  items: z.array(SeasonTicketAdminSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});