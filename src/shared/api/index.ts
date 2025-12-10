// Main API barrel export file

// Types
export * from './types';

// Schemas (export for validation if needed)
export * from './schemas';

// Configuration and utilities
export { apiClient, tokenStorage, withIdempotency, createQueryString, validateResponse, config, ValidationError } from './config';

// Error handling
export * from './error-handler';

// Authentication
export * from './auth';

// API Clients
export { authClient } from './clients/auth';
export { clientsClient } from './clients/clients';
export { eventsClient } from './clients/events';
export { sessionsClient } from './clients/sessions';
export { bookingsClient } from './clients/bookings';
export { paymentsClient } from './clients/payments';
export { certificatesClient } from './clients/certificates';
export { seasonTicketsClient } from './clients/season-tickets';
export { bonusClient } from './clients/bonus';
export { waitlistClient } from './clients/waitlist';
export { adminClient } from './clients/admin';
export { webhooksClient } from './clients/webhooks';
export { imagesClient } from './clients/images';

// Hooks - Auth
export * from './hooks/auth';

// Hooks - Clients (Telegram users)
export * from './hooks/clients';

// Hooks - Events
export * from './hooks/events';

// Hooks - Sessions
export * from './hooks/sessions';

// Hooks - Bookings
export * from './hooks/bookings';

// Hooks - Payments
export * from './hooks/payments';

// Hooks - Certificates
export * from './hooks/certificates';

// Hooks - Season Tickets
export * from './hooks/season-tickets';

// Hooks - Bonus
export * from './hooks/bonus';

// Hooks - Waitlist
export * from './hooks/waitlist';

// Hooks - Admin
export * from './hooks/admin';

// Hooks - Images
export * from './hooks/images';

// Providers
export { ApiProvider } from './providers/ApiProvider';

// Query key factories (for advanced usage)
export { authKeys } from './auth';
export { clientsKeys } from './hooks/clients';
export { eventsKeys } from './hooks/events';
export { sessionsKeys } from './hooks/sessions';
export { bookingsKeys } from './hooks/bookings';
export { paymentsKeys } from './hooks/payments';
export { certificatesKeys, certificatesAdminKeys } from './hooks/certificates';
export { seasonTicketsKeys, seasonTicketsAdminKeys } from './hooks/season-tickets';
export { bonusKeys } from './hooks/bonus';
export { waitlistKeys } from './hooks/waitlist';
export { adminKeys } from './hooks/admin';
export { imagesKeys } from './hooks/images';

// Common utilities and helpers
export {
  // Permission helpers
  hasPermission,
  requirePermission,
  // Legacy role helpers for backward compatibility
  hasRole,
  isAdmin,
  isUser,
  requireAuth,
  requireAdmin,
  // Auth utilities
  performLogout,
} from './auth';
