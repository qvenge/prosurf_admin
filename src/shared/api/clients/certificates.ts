import { apiClient, validateResponse, createQueryString } from '../config';
import { joinApiUrl } from '../../lib/url-utils';
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
  ClientInfo,
} from '../types';

/**
 * Трансформация photoUrl в ClientInfo в полный URL.
 */
const transformClientInfo = (info: ClientInfo | null | undefined): ClientInfo | null | undefined => {
  if (!info) return info;
  return {
    ...info,
    photoUrl: joinApiUrl(info.photoUrl) ?? info.photoUrl,
  };
};

/**
 * Трансформация CertificateAdmin с полными URL фото клиентов.
 */
const transformCertificateAdmin = (cert: CertificateAdmin): CertificateAdmin => ({
  ...cert,
  purchasedBy: transformClientInfo(cert.purchasedBy),
  activatedBy: transformClientInfo(cert.activatedBy),
});

/**
 * API-клиент сертификатов.
 */
export const certificatesClient = {
  /**
   * Создание сертификата (только ADMIN).
   * POST /certificates
   */
  async createCertificate(data: CertificateCreateDto): Promise<Certificate> {
    const validatedData = CertificateCreateDtoSchema.parse(data);

    const response = await apiClient.post('/certificates', validatedData);
    return validateResponse(response.data, CertificateSchema);
  },

  /**
   * Получение сертификатов (свои или все для ADMIN).
   * GET /certificates
   */
  async getCertificates(filters?: CertificateFilters): Promise<PaginatedResponse<Certificate>> {
    const validatedFilters = CertificateFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/certificates${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(CertificateSchema));
  },

  /**
   * Получение всех сертификатов для админа с постраничной пагинацией.
   * GET /certificates/admin
   */
  async getCertificatesAdmin(filters?: CertificateAdminFilters): Promise<CertificateAdminPaginatedResponse> {
    const validatedFilters = CertificateAdminFiltersSchema.parse(filters || {});

    const { sort, ...restFilters } = validatedFilters;
    const serializedFilters: Record<string, unknown> = { ...restFilters };
    if (sort && sort.length > 0) {
      serializedFilters.sort = sort.map((s) => `${s.field}:${s.order}`).join(',');
    }

    const queryString = createQueryString(serializedFilters);

    const response = await apiClient.get(`/certificates/admin${queryString}`);
    const data = validateResponse(response.data, CertificateAdminPaginatedResponseSchema);

    return {
      ...data,
      items: data.items.map(transformCertificateAdmin),
    };
  },

  /**
   * Получение сертификата по ID для админа.
   * GET /certificates/admin/:id
   */
  async getCertificateAdmin(id: string): Promise<CertificateAdmin> {
    const response = await apiClient.get(`/certificates/admin/${id}`);
    return transformCertificateAdmin(validateResponse(response.data, CertificateAdminSchema));
  },

  /**
   * Создание сертификата админом (без оплаты).
   * POST /certificates/admin
   */
  async createCertificateAdmin(data: AdminCreateCertificateDto): Promise<CertificateAdmin> {
    const validatedData = AdminCreateCertificateDtoSchema.parse(data);

    const response = await apiClient.post('/certificates/admin', validatedData);
    return transformCertificateAdmin(validateResponse(response.data, CertificateAdminSchema));
  },

  /**
   * Обновление сертификата админом.
   * PATCH /certificates/admin/:id
   */
  async updateCertificateAdmin(id: string, data: AdminUpdateCertificateDto): Promise<CertificateAdmin> {
    const validatedData = AdminUpdateCertificateDtoSchema.parse(data);

    const response = await apiClient.patch(`/certificates/admin/${id}`, validatedData);
    return transformCertificateAdmin(validateResponse(response.data, CertificateAdminSchema));
  },

  /**
   * Удаление сертификата админом.
   * DELETE /certificates/admin/:id
   */
  async deleteCertificateAdmin(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/certificates/admin/${id}`);
    return response.data;
  },
};