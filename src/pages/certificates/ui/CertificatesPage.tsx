import { useState, useCallback } from 'react';
import { Button } from '@/shared/ui';
import { useCertificatesAdmin, type CertificateAdminFilters, type SortCriterion } from '@/shared/api';
import { CertificatesTable } from './components/CertificatesTable';
import { CertificatesFilters } from './components/CertificatesFilters';
import { CertificatePagination } from './components/CertificatePagination';
import { CertificateFormModal } from './components/CertificateFormModal';
import styles from './CertificatesPage.module.scss';

export function CertificatesPage() {
  const [filters, setFilters] = useState<CertificateAdminFilters>({
    page: 1,
    limit: 20,
    sort: [],
  });
  const [modalState, setModalState] = useState<{ isOpen: boolean; certificateId: string | null }>({
    isOpen: false,
    certificateId: null,
  });

  const { data, isLoading } = useCertificatesAdmin(filters);

  const handleFilterChange = useCallback((newFilters: Partial<CertificateAdminFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  const handleSortChange = useCallback((sort: SortCriterion[]) => {
    setFilters((prev) => ({
      ...prev,
      sort,
      page: 1, // Reset to first page when sort changes
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  const handleCreate = useCallback(() => {
    setModalState({ isOpen: true, certificateId: null });
  }, []);

  const handleEdit = useCallback((id: string) => {
    setModalState({ isOpen: true, certificateId: id });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ isOpen: false, certificateId: null });
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Сертификаты</h1>
        <Button type="primary" size="m" onClick={handleCreate}>
          Создать сертификат
        </Button>
      </div>

      <div className={styles.content}>
        <CertificatesFilters filters={filters} onFilterChange={handleFilterChange} />

        <CertificatesTable
          data={data?.items || []}
          isLoading={isLoading}
          sort={filters.sort || []}
          onSortChange={handleSortChange}
          onEdit={handleEdit}
        />

        {data && data.totalPages > 1 && (
          <CertificatePagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {modalState.isOpen && (
        <CertificateFormModal certificateId={modalState.certificateId} onClose={handleCloseModal} />
      )}
    </div>
  );
}
