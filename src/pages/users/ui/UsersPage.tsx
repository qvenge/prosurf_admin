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

  // Use searchParamsString as dependency instead of searchParams object,
  // because URLSearchParams reference may not change when URL params update
  const searchParamsString = searchParams.toString();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sort = useMemo(() => parseSort(searchParams.get('sort')), [searchParamsString]);

  const filters = useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sort: sort as ClientAdminFilters['sort'],
      search: searchParams.get('search') || undefined,
      isActive: searchParams.get('isActive') === 'false' ? false : true,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParamsString, sort]
  );

  const { data, isLoading } = useClientsAdmin(filters);

  const handleFilterChange = useCallback(
    (newFilters: Partial<ClientAdminFilters>) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
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

        return params;
      });
    },
    [setSearchParams]
  );

  const handleSortChange = useCallback(
    (sort: SortCriterion[]) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set('page', '1');
        if (sort.length > 0) {
          params.set('sort', serializeSort(sort));
        } else {
          params.delete('sort');
        }
        return params;
      });
    },
    [setSearchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set('page', String(page));
        return params;
      });
    },
    [setSearchParams]
  );

  const handleOpen = useCallback(
    (id: string) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set('clientId', id);
        return params;
      });
    },
    [setSearchParams]
  );

  const handleClose = useCallback(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete('clientId');
      return params;
    });
  }, [setSearchParams]);

  return (
    <>
      <Header title="Пользователи" />
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
