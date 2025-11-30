import { apiClient, validateResponse, createQueryString } from '../config';
import {
  AdminSchema,
  AdminCreateDtoSchema,
  AdminUpdateDtoSchema,
  AdminSelfUpdateDtoSchema,
  ChangePasswordDtoSchema,
  AdminFiltersSchema,
  AuditLogSchema,
  JobExecutionResultSchema,
  PaginatedResponseSchema,
  AuditLogFiltersSchema
} from '../schemas';
import type {
  Admin,
  AdminCreateDto,
  AdminUpdateDto,
  AdminSelfUpdateDto,
  ChangePasswordDto,
  AdminFilters,
  AuditLog,
  JobExecutionResult,
  PaginatedResponse,
  AuditLogFilters
} from '../types';

/**
 * Admin API client
 *
 * Provides methods for admin management and admin-only operations.
 */
export const adminClient = {
  // ============================================
  // Admin Management Endpoints
  // ============================================

  /**
   * Get list of admins (ADMIN only)
   * GET /admins
   */
  async getAdmins(filters?: AdminFilters): Promise<PaginatedResponse<Admin>> {
    const validatedFilters = AdminFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/admins${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(AdminSchema));
  },

  /**
   * Create a new admin (ADMIN only)
   * POST /admins
   */
  async createAdmin(data: AdminCreateDto): Promise<Admin> {
    const validatedData = AdminCreateDtoSchema.parse(data);

    const response = await apiClient.post('/admins', validatedData);
    return validateResponse(response.data, AdminSchema);
  },

  /**
   * Get admin by ID (ADMIN only)
   * GET /admins/{id}
   */
  async getAdminById(id: string): Promise<Admin> {
    const response = await apiClient.get(`/admins/${encodeURIComponent(id)}`);
    return validateResponse(response.data, AdminSchema);
  },

  /**
   * Update admin (ADMIN only)
   * PATCH /admins/{id}
   */
  async updateAdmin(id: string, data: AdminUpdateDto): Promise<Admin> {
    const validatedData = AdminUpdateDtoSchema.parse(data);

    const response = await apiClient.patch(
      `/admins/${encodeURIComponent(id)}`,
      validatedData
    );
    return validateResponse(response.data, AdminSchema);
  },

  /**
   * Delete admin (ADMIN only)
   * DELETE /admins/{id}
   */
  async deleteAdmin(id: string): Promise<void> {
    await apiClient.delete(`/admins/${encodeURIComponent(id)}`);
  },

  // ============================================
  // Current Admin Profile Endpoints
  // ============================================

  /**
   * Get current admin profile
   * GET /admins/me
   */
  async getMe(): Promise<Admin> {
    const response = await apiClient.get('/admins/me');
    return validateResponse(response.data, AdminSchema);
  },

  /**
   * Update current admin profile
   * PATCH /admins/me
   */
  async updateMe(data: AdminSelfUpdateDto): Promise<Admin> {
    const validatedData = AdminSelfUpdateDtoSchema.parse(data);

    const response = await apiClient.patch('/admins/me', validatedData);
    return validateResponse(response.data, AdminSchema);
  },

  /**
   * Change current admin's password
   * POST /admins/me/password
   */
  async changePassword(data: ChangePasswordDto): Promise<void> {
    const validatedData = ChangePasswordDtoSchema.parse(data);

    await apiClient.post('/admins/me/password', validatedData);
  },

  // ============================================
  // Admin-Only Operations
  // ============================================

  /**
   * Get audit logs (ADMIN only)
   * GET /admin/audit-logs
   */
  async getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
    const validatedFilters = AuditLogFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/admin/audit-logs${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(AuditLogSchema));
  },

  /**
   * Run booking expiry job (ADMIN only)
   * POST /admin/jobs/run/booking-expiry
   */
  async runBookingExpiryJob(): Promise<JobExecutionResult> {
    const response = await apiClient.post('/admin/jobs/run/booking-expiry');
    return validateResponse(response.data, JobExecutionResultSchema);
  },

  /**
   * Run certificate expiry job (ADMIN only)
   * POST /admin/jobs/run/certificate-expiry
   */
  async runCertificateExpiryJob(): Promise<JobExecutionResult> {
    const response = await apiClient.post('/admin/jobs/run/certificate-expiry');
    return validateResponse(response.data, JobExecutionResultSchema);
  },

  /**
   * Run season ticket expiry job (ADMIN only)
   * POST /admin/jobs/run/season-ticket-expiry
   */
  async runSeasonTicketExpiryJob(): Promise<JobExecutionResult> {
    const response = await apiClient.post('/admin/jobs/run/season-ticket-expiry');
    return validateResponse(response.data, JobExecutionResultSchema);
  },
};
