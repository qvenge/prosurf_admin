import { useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { useEventsData, useEventsColumns, useInfiniteScroll } from '../lib';
import { useDeleteEvent } from '@/shared/api/hooks/events';
import { Modal, Button } from '@/shared/ui';
import { EventsTableHeader } from './EventsTableHeader';
import { EventsTableBody } from './EventsTableBody';
import styles from './EventsTable.module.scss';

export interface EventsTableProps extends React.HTMLAttributes<HTMLDivElement> {
  eventType?: string;
  handleEdit?: (eventId: string) => void;
}

export function EventsTable({ className, eventType, handleEdit }: EventsTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const bodyContainerRef = useRef<HTMLDivElement | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const {
    eventsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useEventsData({ eventType });

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

  const eventToDeleteData = eventsData.find(e => e.id === eventToDelete);

  const columns = useEventsColumns({ handleEdit, handleDelete });
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: eventsData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useInfiniteScroll({
    containerRef: bodyContainerRef,
    onLoadMore: fetchNextPage,
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
  });

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (error) {
    return <div className={styles.error}>Ошибка загрузки данных</div>;
  }

  return (
    <>
      <div className={clsx(className, styles.tableContainer)} ref={tableContainerRef}>
        <EventsTableHeader table={table} />
        <EventsTableBody
          ref={bodyContainerRef}
          table={table}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          eventsCount={eventsData.length}
        />
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