import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Button, SideModal, Header, Icon } from '@/shared/ui';
import { PlusBold } from '@/shared/ds/icons';
import { useCertificatesAdmin, type CertificateAdminFilters, type SortCriterion } from '@/shared/api';
import { CertificatesTable } from './components/CertificatesTable';
import { CertificatesFilters } from './components/CertificatesFilters';
import { CertificatePagination } from './components/CertificatePagination';
import { CertificateForm } from './components/CertificateForm';
import styles from './CertificatesPage.module.scss';

function serializeSort(sort: SortCriterion[]): string {
  return sort.map((s) => `${s.field}:${s.order}`).join(',');
}

function parseSort(param: string | null): SortCriterion[] {
  if (!param) return [];
  return param.split(',').map((item) => {
    const [field, order] = item.split(':');
    return { field, order: order as 'asc' | 'desc' };
  });
}

export function CertificatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalState, setModalState] = useState<{ isOpen: boolean; certificateId: string | null }>({
    isOpen: false,
    certificateId: null,
  });

  const filters: CertificateAdminFilters = useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sort: parseSort(searchParams.get('sort')),
      type: (searchParams.get('type') as CertificateAdminFilters['type']) || undefined,
      status: (searchParams.get('status') as CertificateAdminFilters['status']) || undefined,
      clientSearch: searchParams.get('clientSearch') || undefined,
    }),
    [searchParams]
  );

  const { data, isLoading } = useCertificatesAdmin(filters);

  const handleFilterChange = useCallback(
    (newFilters: Partial<CertificateAdminFilters>) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          params.delete(key);
        } else if (key === 'sort' && Array.isArray(value)) {
          if (value.length > 0) {
            params.set('sort', serializeSort(value));
          } else {
            params.delete('sort');
          }
        } else {
          params.set(key, String(value));
        }
      });

      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleSortChange = useCallback(
    (sort: SortCriterion[]) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      if (sort.length > 0) {
        params.set('sort', serializeSort(sort));
      } else {
        params.delete('sort');
      }
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', String(page));
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

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
    <>
      <Header title="Сертификаты">
        <Button type="primary" size="l" onClick={handleCreate}>
          <Icon
            className={styles.addIcon}
            src={PlusBold}
            width={20}
            height={20}
          />
          Добавить
        </Button>
      </Header>
      <div className={styles.page}>
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
        <SideModal onClose={handleCloseModal}>
          <CertificateForm certificateId={modalState.certificateId} onClose={handleCloseModal} />
        </SideModal>
      )}
    </>
  );
}
