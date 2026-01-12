import { apiClient, validateResponse, createQueryString } from '../config';
import { joinApiUrl } from '../../lib/url-utils';
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
  AuditLogFiltersSchema,
  ClientAdminFiltersSchema,
  ClientAdminPaginatedResponseSchema,
  EventAdminFiltersSchema,
  EventAdminPaginatedResponseSchema,
  SessionAdminFiltersSchema,
  SessionAdminPaginatedResponseSchema,
  SeasonTicketPlanAdminFiltersSchema,
  SeasonTicketPlanAdminPaginatedResponseSchema,
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
  AuditLogFilters,
  Client,
  ClientAdminFilters,
  ClientAdminPaginatedResponse,
  EventAdminFilters,
  EventAdminPaginatedResponse,
  SessionAdminFilters,
  SessionAdminPaginatedResponse,
  SeasonTicketPlanAdminFilters,
  SeasonTicketPlanAdminPaginatedResponse,
} from '../types';

/**
 * Трансформация photoUrl клиента в полный URL.
 */
const transformClient = (client: Client): Client => ({
  ...client,
  photoUrl: joinApiUrl(client.photoUrl) ?? client.photoUrl,
});

/**
 * API-клиент администрирования.
 */
export const adminClient = {
  /**
   * Получение списка админов (только ADMIN).
   * GET /admins
   */
  async getAdmins(filters?: AdminFilters): Promise<PaginatedResponse<Admin>> {
    const validatedFilters = AdminFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/admins${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(AdminSchema));
  },

  /**
   * Создание нового админа (только ADMIN).
   * POST /admins
   */
  async createAdmin(data: AdminCreateDto): Promise<Admin> {
    const validatedData = AdminCreateDtoSchema.parse(data);

    const response = await apiClient.post('/admins', validatedData);
    return validateResponse(response.data, AdminSchema);
  },

  /**
   * Получение админа по ID (только ADMIN).
   * GET /admins/{id}
   */
  async getAdminById(id: string): Promise<Admin> {
    const response = await apiClient.get(`/admins/${encodeURIComponent(id)}`);
    return validateResponse(response.data, AdminSchema);
  },

  /**
   * Обновление админа (только ADMIN).
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
   * Удаление админа (только ADMIN).
   * DELETE /admins/{id}
   */
  async deleteAdmin(id: string): Promise<void> {
    await apiClient.delete(`/admins/${encodeURIComponent(id)}`);
  },

  /**
   * Получение профиля текущего админа.
   * GET /admins/me
   */
  async getMe(): Promise<Admin> {
    const response = await apiClient.get('/admins/me');
    return validateResponse(response.data, AdminSchema);
  },

  /**
   * Обновление профиля текущего админа.
   * PATCH /admins/me
   */
  async updateMe(data: AdminSelfUpdateDto): Promise<Admin> {
    const validatedData = AdminSelfUpdateDtoSchema.parse(data);

    const response = await apiClient.patch('/admins/me', validatedData);
    return validateResponse(response.data, AdminSchema);
  },

  /**
   * Смена пароля текущего админа.
   * POST /admins/me/password
   */
  async changePassword(data: ChangePasswordDto): Promise<void> {
    const validatedData = ChangePasswordDtoSchema.parse(data);

    await apiClient.post('/admins/me/password', validatedData);
  },

  /**
   * Получение журнала аудита (только ADMIN).
   * GET /admin/audit-logs
   */
  async getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
    const validatedFilters = AuditLogFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/admin/audit-logs${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(AuditLogSchema));
  },

  /**
   * Запуск джоба истечения бронирований (только ADMIN).
   * POST /admin/jobs/run/booking-expiry
   */
  async runBookingExpiryJob(): Promise<JobExecutionResult> {
    const response = await apiClient.post('/admin/jobs/run/booking-expiry');
    return validateResponse(response.data, JobExecutionResultSchema);
  },

  /**
   * Запуск джоба истечения сертификатов (только ADMIN).
   * POST /admin/jobs/run/certificate-expiry
   */
  async runCertificateExpiryJob(): Promise<JobExecutionResult> {
    const response = await apiClient.post('/admin/jobs/run/certificate-expiry');
    return validateResponse(response.data, JobExecutionResultSchema);
  },

  /**
   * Запуск джоба истечения абонементов (только ADMIN).
   * POST /admin/jobs/run/season-ticket-expiry
   */
  async runSeasonTicketExpiryJob(): Promise<JobExecutionResult> {
    const response = await apiClient.post('/admin/jobs/run/season-ticket-expiry');
    return validateResponse(response.data, JobExecutionResultSchema);
  },

  /**
   * Получение списка клиентов для админа (только ADMIN).
   * GET /admin/clients
   */
  async getClientsAdmin(filters?: ClientAdminFilters): Promise<ClientAdminPaginatedResponse> {
    const validatedFilters = ClientAdminFiltersSchema.parse(filters || {});

    const { sort, ...restFilters } = validatedFilters;
    const serializedFilters: Record<string, unknown> = { ...restFilters };
    if (sort && sort.length > 0) {
      serializedFilters.sort = sort.map((s) => `${s.field}:${s.order}`).join(',');
    }

    const queryString = createQueryString(serializedFilters);

    const response = await apiClient.get(`/admin/clients${queryString}`);
    const data = validateResponse(response.data, ClientAdminPaginatedResponseSchema);

    return {
      ...data,
      items: data.items.map(transformClient),
    };
  },

  /**
   * Получение списка мероприятий для админа (только ADMIN).
   * GET /admin/events
   */
  async getEventsAdmin(filters?: EventAdminFilters): Promise<EventAdminPaginatedResponse> {
    const validatedFilters = EventAdminFiltersSchema.parse(filters || {});

    const { sort, ...restFilters } = validatedFilters;
    const serializedFilters: Record<string, unknown> = { ...restFilters };
    if (sort && sort.length > 0) {
      serializedFilters.sort = sort.map((s) => `${s.field}:${s.order}`).join(',');
    }

    const queryString = createQueryString(serializedFilters);

    const response = await apiClient.get(`/admin/events${queryString}`);
    return validateResponse(response.data, EventAdminPaginatedResponseSchema);
  },

  /**
   * Получение списка сессий для админа (только ADMIN).
   * GET /admin/sessions
   */
  async getSessionsAdmin(filters?: SessionAdminFilters): Promise<SessionAdminPaginatedResponse> {
    const validatedFilters = SessionAdminFiltersSchema.parse(filters || {});

    const { sort, ...restFilters } = validatedFilters;
    const serializedFilters: Record<string, unknown> = { ...restFilters };
    if (sort && sort.length > 0) {
      serializedFilters.sort = sort.map((s) => `${s.field}:${s.order}`).join(',');
    }

    const queryString = createQueryString(serializedFilters);

    const response = await apiClient.get(`/admin/sessions${queryString}`);
    return validateResponse(response.data, SessionAdminPaginatedResponseSchema);
  },

  /**
   * Получение списка тарифных планов абонементов для админа (только ADMIN).
   * GET /admin/season-ticket-plans
   */
  async getSeasonTicketPlansAdmin(filters?: SeasonTicketPlanAdminFilters): Promise<SeasonTicketPlanAdminPaginatedResponse> {
    const validatedFilters = SeasonTicketPlanAdminFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/admin/season-ticket-plans${queryString}`);
    return validateResponse(response.data, SeasonTicketPlanAdminPaginatedResponseSchema);
  },
};
