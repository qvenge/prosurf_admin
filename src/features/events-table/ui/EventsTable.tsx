import { useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { useEventsData, useEventsColumns, useInfiniteScroll } from '../lib';
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

  const {
    eventsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useEventsData({ eventType });

  const columns = useEventsColumns({ handleEdit });
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
    return <div className={styles.loading}>Loading training data...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error loading training data</div>;
  }

  return (
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
  );
}