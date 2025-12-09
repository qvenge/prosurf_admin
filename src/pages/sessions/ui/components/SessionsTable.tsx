import { useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { CaretRightBold, TrashBold } from '@/shared/ds/icons';
import { DataTable, Pagination, IconButton, Modal, Button, type ColumnDef } from '@/shared/ui';
import { useSessionsAdmin } from '@/shared/api/hooks/admin';
import { useDeleteSession, type Session } from '@/shared/api';
import { formatDate, formatTime, formatPrice } from '@/shared/lib/format-utils';
import styles from './SessionsTable.module.scss';

type SessionRowData = {
  id: string;
  title: string;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETE' | undefined;
  location: string | null | undefined;
  price: string | null;
  occupied: string;
  startsAt: string;
};

export interface SessionsTableProps extends React.HTMLAttributes<HTMLDivElement> {
  eventType: string;
  eventId?: string | null;
}

export function SessionsTable({ className, eventType, eventId }: SessionsTableProps) {
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const deleteSessionMutation = useDeleteSession();

  const { data, isLoading, error } = useSessionsAdmin({
    page,
    limit: 20,
    labels: eventType ? [eventType] : undefined,
    eventId: eventId || undefined,
  });

  const handleDelete = (sessionId: string) => {
    setSessionToDelete(sessionId);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteSessionMutation.mutate({ id: sessionToDelete });
      setSessionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setSessionToDelete(null);
  };

  const handleEdit = useCallback((sessionId: string) => {
    searchParams.set('sessionId', sessionId);
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  // Transform data for display
  const sessionsData: SessionRowData[] = useMemo(() => {
    if (!data?.items) return [];

    return data.items.map((session: Session) => {
      const event = session.event;
      const minPrice = event.tickets.length > 0
        ? event.tickets.map(ticket => ticket.full.price).reduce((minPrice, price) => {
            return price.amountMinor < minPrice.amountMinor ? price : minPrice;
          })
        : null;

      return {
        id: session.id,
        title: event.title,
        status: session.status,
        location: event.location,
        price: minPrice ? formatPrice(minPrice) : null,
        occupied: (() => {
          const capacity = session.capacity ?? event.capacity;
          return capacity !== null && capacity !== undefined
            ? `${capacity - session.remainingSeats} из ${capacity}`
            : `${session.remainingSeats > 0 ? '?' : '0'} из ?`;
        })(),
        startsAt: session.startsAt,
      };
    });
  }, [data]);

  const sessionToDeleteData = sessionsData.find(s => s.id === sessionToDelete);

  const columns: ColumnDef<SessionRowData>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Название',
      render: (item) => item.title,
    },
    {
      id: 'status',
      label: 'Статус',
      width: '120px',
      render: (item) => {
        const labels: Record<string, string> = {
          SCHEDULED: 'Запланировано',
          CANCELLED: 'Отменено',
          COMPLETE: 'Завершено',
        };
        return item.status ? (
          <span className={styles[`status${item.status}`]}>{labels[item.status] ?? item.status}</span>
        ) : null;
      },
    },
    {
      id: 'location',
      label: 'Место',
      render: (item) => item.location || '—',
    },
    {
      id: 'price',
      label: 'Цена',
      render: (item) => item.price || '—',
    },
    {
      id: 'occupied',
      label: 'Записи',
      render: (item) => item.occupied,
    },
    {
      id: 'datetime',
      label: 'Дата',
      render: (item) => (
        <div className={styles.datetime}>
          <span className={styles.date}>{formatDate(item.startsAt)}</span>
          <span className={styles.time}>{formatTime(item.startsAt)}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      label: '',
      width: '100px',
      align: 'right',
      render: (item) => (
        <div className={styles.actions}>
          <IconButton
            src={TrashBold}
            type="secondary"
            size="s"
            onClick={() => handleDelete(item.id)}
          />
          <IconButton
            src={CaretRightBold}
            type="secondary"
            size="s"
            onClick={() => handleEdit(item.id)}
          />
        </div>
      ),
    },
  ], [handleEdit]);

  if (error) {
    return <div className={styles.error}>Ошибка загрузки сеансов</div>;
  }

  return (
    <>
      <div className={className}>
        <DataTable
          columns={columns}
          data={sessionsData}
          isLoading={isLoading}
          emptyMessage="Нет сеансов"
          getRowKey={(item) => item.id}
        />
        {data && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </div>
      {sessionToDelete && (
        <Modal onClose={cancelDelete}>
          <div className={styles.deleteModal}>
            <h3>Удалить сеанс?</h3>
            <p>Вы уверены, что хотите удалить "{sessionToDeleteData?.title}"?</p>
            <div className={styles.deleteModalActions}>
              <Button type="secondary" size="m" onClick={cancelDelete}>
                Отмена
              </Button>
              <Button type="primary" size="m" onClick={confirmDelete}>
                Удалить
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
