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

  // Use searchParamsString as dependency instead of searchParams object,
  // because URLSearchParams reference may not change when URL params update
  const searchParamsString = searchParams.toString();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sort = useMemo(() => parseSort(searchParams.get('sort')), [searchParamsString]);

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
      'labels.any': searchParams.get('labels.any')
        ? [searchParams.get('labels.any') as string]
        : undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParamsString, sort, eventId]
  );

  // Fetch sessions for table view (only when list view is active)
  const { data, isLoading } = useSessionsAdmin(filters, selectedView === 'list');

  const handleFilterChange = useCallback(
    (newFilters: Partial<SessionAdminFilters>) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
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
          } else if (key === 'labels.any' && Array.isArray(value)) {
            if (value.length > 0) {
              params.set('labels.any', value[0] as string);
            } else {
              params.delete('labels.any');
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
    (newSort: SortCriterion[]) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set('page', '1');
        if (newSort.length > 0) {
          params.set('sort', serializeSort(newSort));
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

  const handleView = useCallback(
    (id: string) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set('sessionId', id);
        return params;
      });
    },
    [setSearchParams]
  );

  const handleClearEvent = useCallback(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete('eventId');
      params.set('page', '1');
      return params;
    });
  }, [setSearchParams]);

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleCloseSession = useCallback(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete('sessionId');
      return params;
    });
  }, [setSearchParams]);

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
            eventType={filters['labels.any']?.[0]}
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
