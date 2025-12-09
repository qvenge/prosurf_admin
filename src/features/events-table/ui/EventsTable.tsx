import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useEventsAdmin } from '@/shared/api/hooks/admin';
import { useDeleteEvent } from '@/shared/api/hooks/events';
import { DataTable, Pagination, Modal, Button, IconButton, type ColumnDef } from '@/shared/ui';
import { PencilSimpleBold, TrashBold } from '@/shared/ds/icons';
import { formatPrice } from '@/shared/lib/format-utils';
import type { Event } from '@/shared/api';
import styles from './EventsTable.module.scss';

export interface EventsTableProps extends React.HTMLAttributes<HTMLDivElement> {
  eventType?: string;
  handleEdit?: (eventId: string) => void;
}

type EventRowData = {
  id: string;
  title: string;
  status: 'ACTIVE' | 'CANCELLED';
  location: string | null | undefined;
  prepayment?: string | null;
  price: string | null;
  capacity?: number;
};

export function EventsTable({ className, eventType, handleEdit }: EventsTableProps) {
  const [page, setPage] = useState(1);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const { data, isLoading, error } = useEventsAdmin({
    page,
    limit: 20,
    labels: eventType ? [eventType] : undefined,
  });

  const deleteEventMutation = useDeleteEvent();

  const handleDelete = (eventId: string) => {
    setEventToDelete(eventId);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteEventMutation.mutate({ id: eventToDelete, force: true });
      setEventToDelete(null);
    }
  };

  const cancelDelete = () => {
    setEventToDelete(null);
  };

  // Transform data for display
  const eventsData: EventRowData[] = useMemo(() => {
    if (!data?.items) return [];

    return data.items.map((event: Event) => {
      const ticket = event.tickets.length > 0
        ? event.tickets.reduce((minTicket, ticket) => {
            if (ticket.full.price.amountMinor < minTicket.full.price.amountMinor) {
              return ticket;
            }
            return minTicket;
          })
        : null;

      return {
        id: event.id,
        title: event.title,
        status: event.status ?? 'ACTIVE',
        location: event.location,
        prepayment: ticket?.prepayment?.price && ticket.prepayment.price.amountMinor > 0
          ? formatPrice(ticket.prepayment.price)
          : null,
        price: ticket?.full.price && ticket.full.price.amountMinor > 0
          ? formatPrice(ticket.full.price)
          : null,
        capacity: event.capacity ?? 0,
      };
    });
  }, [data]);

  const eventToDeleteData = eventsData.find(e => e.id === eventToDelete);

  const columns: ColumnDef<EventRowData>[] = useMemo(() => [
    {
      id: 'title',
      label: 'Название',
      render: (item) => item.title,
    },
    {
      id: 'status',
      label: 'Статус',
      width: '100px',
      render: (item) => {
        const label = item.status === 'ACTIVE' ? 'Активно' : 'Отменено';
        return <span className={styles[`status${item.status}`]}>{label}</span>;
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
      render: (item) => (
        <div className={styles.priceContainer}>
          <div className={styles.price}>{item.price}</div>
          {item.prepayment && (
            <div className={styles.prepayment}>{item.prepayment}</div>
          )}
        </div>
      ),
    },
    {
      id: 'capacity',
      label: 'Кол-во мест',
      render: (item) => item.capacity,
    },
    {
      id: 'sessions',
      label: 'Сеансы',
      render: (item) => (
        <Link className={styles.link} to={`/?eventId=${item.id}`}>
          Перейти
        </Link>
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
            src={PencilSimpleBold}
            type="secondary"
            size="s"
            onClick={() => handleEdit?.(item.id)}
          />
        </div>
      ),
    },
  ], [handleEdit]);

  if (error) {
    return <div className={styles.error}>Ошибка загрузки данных</div>;
  }

  return (
    <>
      <div className={className}>
        <DataTable
          columns={columns}
          data={eventsData}
          isLoading={isLoading}
          emptyMessage="Нет мероприятий"
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
      {eventToDelete && (
        <Modal onClose={cancelDelete}>
          <div className={styles.deleteModal}>
            <h3>Удалить мероприятие?</h3>
            <p>Вы уверены, что хотите удалить "{eventToDeleteData?.title}"?</p>
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
