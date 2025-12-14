import { useMemo, useState } from 'react';
import { CaretRightBold, TrashBold } from '@/shared/ds/icons';
import { DataTable, IconButton, Modal, Button, type ColumnDef, type SortCriterion } from '@/shared/ui';
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
  remainingSeats: number;
};

export interface SessionsTableProps {
  className?: string;
  data: Session[];
  isLoading: boolean;
  sort: SortCriterion[];
  onSortChange: (sort: SortCriterion[]) => void;
  onView: (id: string) => void;
}

export function SessionsTable({
  className,
  data,
  isLoading,
  sort,
  onSortChange,
  onView,
}: SessionsTableProps) {
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const deleteSessionMutation = useDeleteSession();

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

  // Transform data for display
  const sessionsData: SessionRowData[] = useMemo(() => {
    if (!data) return [];

    return data.map((session: Session) => {
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
        remainingSeats: session.remainingSeats,
      };
    });
  }, [data]);

  const sessionToDeleteData = sessionsData.find(s => s.id === sessionToDelete);

  const columns: ColumnDef<SessionRowData>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Название',
      sortable: true,
      sortKey: 'eventTitle',
      render: (item) => item.title,
    },
    {
      id: 'status',
      label: 'Статус',
      width: '120px',
      sortable: true,
      sortKey: 'status',
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
      sortable: true,
      sortKey: 'remainingSeats',
      render: (item) => item.occupied,
    },
    {
      id: 'datetime',
      label: 'Дата',
      sortable: true,
      sortKey: 'startsAt',
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
            onClick={() => onView(item.id)}
          />
        </div>
      ),
    },
  ], [onView]);

  return (
    <>
      <DataTable
        className={className}
        columns={columns}
        data={sessionsData}
        isLoading={isLoading}
        emptyMessage="Нет сеансов"
        getRowKey={(item) => item.id}
        sort={sort}
        onSortChange={onSortChange}
      />
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
