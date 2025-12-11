import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { EventForm } from '@/features/event-form';
import { Button, Icon, SideModal, Header, Pagination, type SortCriterion } from '@/shared/ui';
import { PlusBold } from '@/shared/ds/icons';
import { useEventsAdmin, type EventAdminFilters } from '@/shared/api';
import { TemplatesTable } from './components/TemplatesTable';
import { TemplatesFilters } from './components/TemplatesFilters';
import styles from './TemplatesPage.module.scss';

const categoryOptions = [
  { value: 'training:surfing', label: 'Серфинг' },
  { value: 'training:surfskate', label: 'Серфскейт' },
  { value: 'tour', label: 'Тур' },
  { value: 'activity', label: 'Активность' },
];

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

export function TemplatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | undefined>(undefined);

  const sort = useMemo(() => parseSort(searchParams.get('sort')), [searchParams]);

  const filters = useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sort: sort as EventAdminFilters['sort'],
      status: (searchParams.get('status') as EventAdminFilters['status']) || undefined,
    }),
    [searchParams, sort]
  );

  const { data, isLoading } = useEventsAdmin(filters);

  const handleFilterChange = useCallback(
    (newFilters: Partial<EventAdminFilters>) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          params.delete(key);
        } else if (key === 'sort' && Array.isArray(value)) {
          if (value.length > 0) {
            params.set('sort', serializeSort(value as SortCriterion[]));
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

  const handleCreate = () => {
    setEditingEventId(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (eventId: string) => {
    setEditingEventId(eventId);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingEventId(undefined);
  };

  return (
    <>
      <Header title={'Шаблоны'}>
        <Button
          type="primary"
          size="l"
          onClick={handleCreate}
        >
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
        <TemplatesFilters filters={filters} onFilterChange={handleFilterChange} />

        <TemplatesTable
          data={data?.items || []}
          isLoading={isLoading}
          sort={sort}
          onSortChange={handleSortChange}
          onEdit={handleEdit}
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
      {isModalOpen && (
        <SideModal onClose={handleClose}>
          <EventForm
            categories={categoryOptions.map(option => ({
              ...option,
              selected: option.value === categoryOptions[0].value
            }))}
            onClose={handleClose}
            eventId={editingEventId}
          />
        </SideModal>
      )}
    </>
  );
}
