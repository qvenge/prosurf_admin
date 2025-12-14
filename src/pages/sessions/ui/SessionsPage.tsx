import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Header, Button, Icon, SideModal, SegmentedButtons, Pagination, type SortCriterion } from '@/shared/ui';
import { SessionsTable } from './components/SessionsTable';
import { SessionsCalendar } from './components/SessionsCalendar';
import { SessionForm } from './components/SessionForm';
import { SessionDetails } from './components/SessionDetails';
import { SessionsFilters } from './components/SessionsFilters';
import { PlusBold } from '@/shared/ds/icons';
import styles from './SessionsPage.module.scss';
import {
  useEvent,
  useSessionsAdmin,
  type SessionAdminFilters,
  type SessionStatus,
} from '@/shared/api';

const views = [
  { value: 'calendar', label: 'Календарь' },
  { value: 'list', label: 'Список' },
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

export function SessionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const sessionId = searchParams.get('sessionId');

  const [selectedView, setSelectedView] = useState(views[0].value);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sort = useMemo(() => parseSort(searchParams.get('sort')), [searchParams]);

  // Get event data for badge
  const { data: event } = useEvent(eventId ?? undefined, !!eventId);

  // Build filters from URL params
  const filters = useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      sort: sort as SessionAdminFilters['sort'],
      eventId: eventId || undefined,
      status: (searchParams.get('status') || undefined) as SessionStatus | undefined,
      labels: searchParams.get('labels')
        ? [searchParams.get('labels') as string]
        : undefined,
    }),
    [searchParams, sort, eventId]
  );

  // Fetch sessions for table view
  const { data, isLoading } = useSessionsAdmin(filters);

  const handleFilterChange = useCallback(
    (newFilters: Partial<SessionAdminFilters>) => {
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
        } else if (key === 'labels' && Array.isArray(value)) {
          if (value.length > 0) {
            params.set('labels', value[0] as string);
          } else {
            params.delete('labels');
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
    (newSort: SortCriterion[]) => {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      if (newSort.length > 0) {
        params.set('sort', serializeSort(newSort));
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

  const handleView = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('sessionId', id);
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleClearEvent = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('eventId');
    params.set('page', '1');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleCloseSession = () => {
    searchParams.delete('sessionId');
    setSearchParams(searchParams);
  };

  return (
    <>
      <Header title={'Записи'}>
        <SegmentedButtons
          options={views}
          value={selectedView}
          onChange={(value) => {
            setSelectedView(value);
          }}
        />
        <Button type="primary" size="l" onClick={handleCreate}>
          <Icon src={PlusBold} width={20} height={20} />
          Добавить
        </Button>
      </Header>
      <div className={styles.page}>
        <SessionsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          eventName={event?.title}
          onClearEvent={eventId ? handleClearEvent : undefined}
        />
        {selectedView === 'calendar' ? (
          <SessionsCalendar
            eventType={filters.labels?.[0]}
            eventId={eventId}
            status={filters.status}
            className={styles.calendar}
          />
        ) : (
          <>
            <SessionsTable
              data={data?.items || []}
              isLoading={isLoading}
              sort={sort}
              onSortChange={handleSortChange}
              onView={handleView}
              className={styles.table}
            />
            {data && (
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
      {isModalOpen && (
        <SideModal onClose={handleClose}>
          <SessionForm onClose={handleClose} />
        </SideModal>
      )}
      {sessionId && (
        <SideModal onClose={handleCloseSession}>
          <SessionDetails sessionId={sessionId} />
        </SideModal>
      )}
    </>
  );
}
