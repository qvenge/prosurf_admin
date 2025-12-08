import { apiClient, validateResponse, createQueryString } from '../config';
import {
  CertificateSchema,
  CertificateCreateDtoSchema,
  PaginatedResponseSchema,
  CertificateFiltersSchema,
  CertificateAdminSchema,
  CertificateAdminPaginatedResponseSchema,
  CertificateAdminFiltersSchema,
  AdminCreateCertificateDtoSchema,
  AdminUpdateCertificateDtoSchema,
} from '../schemas';
import type {
  Certificate,
  CertificateCreateDto,
  PaginatedResponse,
  CertificateFilters,
  CertificateAdmin,
  CertificateAdminPaginatedResponse,
  CertificateAdminFilters,
  AdminCreateCertificateDto,
  AdminUpdateCertificateDto,
} from '../types';

/**
 * Certificates API client
 */
export const certificatesClient = {
  /**
   * Issue/create certificate (ADMIN only)
   * POST /certificates
   */
  async createCertificate(data: CertificateCreateDto): Promise<Certificate> {
    const validatedData = CertificateCreateDtoSchema.parse(data);

    const response = await apiClient.post('/certificates', validatedData);
    return validateResponse(response.data, CertificateSchema);
  },

  /**
   * Get certificates (user's own or all for ADMIN)
   * GET /certificates
   */
  async getCertificates(filters?: CertificateFilters): Promise<PaginatedResponse<Certificate>> {
    const validatedFilters = CertificateFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/certificates${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(CertificateSchema));
  },

  // ========================================
  // Admin endpoints
  // ========================================

  /**
   * Get all certificates for admin with page-based pagination
   * GET /certificates/admin
   */
  async getCertificatesAdmin(filters?: CertificateAdminFilters): Promise<CertificateAdminPaginatedResponse> {
    const validatedFilters = CertificateAdminFiltersSchema.parse(filters || {});

    // Serialize sort array to string format: "field:order,field:order"
    const { sort, ...restFilters } = validatedFilters;
    const serializedFilters: Record<string, unknown> = { ...restFilters };
    if (sort && sort.length > 0) {
      serializedFilters.sort = sort.map((s) => `${s.field}:${s.order}`).join(',');
    }

    const queryString = createQueryString(serializedFilters);

    const response = await apiClient.get(`/certificates/admin${queryString}`);
    return validateResponse(response.data, CertificateAdminPaginatedResponseSchema);
  },

  /**
   * Get single certificate by ID for admin
   * GET /certificates/admin/:id
   */
  async getCertificateAdmin(id: string): Promise<CertificateAdmin> {
    const response = await apiClient.get(`/certificates/admin/${id}`);
    return validateResponse(response.data, CertificateAdminSchema);
  },

  /**
   * Create certificate as admin (without payment)
   * POST /certificates/admin
   */
  async createCertificateAdmin(data: AdminCreateCertificateDto): Promise<CertificateAdmin> {
    const validatedData = AdminCreateCertificateDtoSchema.parse(data);

    const response = await apiClient.post('/certificates/admin', validatedData);
    return validateResponse(response.data, CertificateAdminSchema);
  },

  /**
   * Update certificate as admin
   * PATCH /certificates/admin/:id
   */
  async updateCertificateAdmin(id: string, data: AdminUpdateCertificateDto): Promise<CertificateAdmin> {
    const validatedData = AdminUpdateCertificateDtoSchema.parse(data);

    const response = await apiClient.patch(`/certificates/admin/${id}`, validatedData);
    return validateResponse(response.data, CertificateAdminSchema);
  },

  /**
   * Delete certificate as admin
   * DELETE /certificates/admin/:id
   */
  async deleteCertificateAdmin(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/certificates/admin/${id}`);
    return response.data;
  },
};