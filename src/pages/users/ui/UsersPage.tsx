import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Header, SideModal, Pagination, type SortCriterion } from '@/shared/ui';
import { useClientsAdmin, useClient, type ClientAdminFilters } from '@/shared/api';
import { UsersTable } from './components/UsersTable';
import { UsersFilters } from './components/UsersFilters';
import { UserCard } from '@/features/user-card';
import styles from './UsersPage.module.scss';

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

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const { data: clientData } = useClient(clientId ?? '');

  const sort = useMemo(() => parseSort(searchParams.get('sort')), [searchParams]);

  const filters = useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sort: sort as ClientAdminFilters['sort'],
      search: searchParams.get('search') || undefined,
    }),
    [searchParams, sort]
  );

  const { data, isLoading } = useClientsAdmin(filters);

  const handleFilterChange = useCallback(
    (newFilters: Partial<ClientAdminFilters>) => {
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

  const handleOpen = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('clientId', id);
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('clientId');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  return (
    <>
      <Header title="Клиенты" />
      <div className={styles.page}>
        <UsersFilters filters={filters} onFilterChange={handleFilterChange} />

        <UsersTable
          className={styles.table}
          data={data?.items || []}
          isLoading={isLoading}
          sort={sort}
          onSortChange={handleSortChange}
          handleEdit={handleOpen}
        />

        {data && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {clientId && clientData && (
        <SideModal onClose={handleClose}>
          <UserCard client={clientData} />
        </SideModal>
      )}
    </>
  );
}
