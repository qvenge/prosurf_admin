import { useMemo, useRef, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { ArrowDownBold, ArrowUpBold, PencilSimpleBold } from '@/shared/ds/icons';
import { Icon, IconButton } from '@/shared/ui';
import { capitalize } from '@/shared/lib/string';
import { useEventsInfinite, useSessionsInfinite, type Event, type Session } from '@/shared/api';
import { formatDate, formatTime, formatPrice } from '@/shared/lib/format-utils';
import styles from './UsersTable.module.scss';

type TrainingRowData = {
  id: string;
  title: string;
  location: string | null | undefined;
  price: string | null;
  capacity: number;
  dates: { date: string; times: string[] }[];
  sessions: Session[];
};

export interface SessionsTableProps extends React.HTMLAttributes<HTMLDivElement> {
  handleEdit?: (eventId: string) => void;
}

const columnHelper = createColumnHelper<TrainingRowData>();

export function UsersTable({ className, handleEdit }: SessionsTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const bodyContainerRef = useRef<HTMLDivElement>(null);

  const {
    data: _trainingData,
    isLoading: trainingLoading,
    error: trainingError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useEventsInfinite({
    limit: 15
  });

  const {
    data: _sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useSessionsInfinite({
    limit: 100
  });

  // Group sessions by event ID for quick lookup
  const sessionsByEventId = useMemo(() => {
    if (!_sessionsData?.pages) return {};

    const allSessions = _sessionsData.pages.flatMap(page => page.items);
    const grouped: Record<string, Session[]> = {};

    allSessions.forEach((session: Session) => {
      const eventId = session.event.id;
      if (!grouped[eventId]) {
        grouped[eventId] = [];
      }
      grouped[eventId].push(session);
    });

    return grouped;
  }, [_sessionsData]);

  const trainingData = useMemo(() => {
    if (!_trainingData?.pages) return [];

    const allEvents = _trainingData.pages.flatMap(page => page.items);

    return allEvents.map((event: Event) => {
      const minPrice = event.tickets.length > 0
        ? event.tickets.map(ticket => ticket.full.price).reduce((minPrice, price) => {
            return price.amountMinor < minPrice.amountMinor ? price : minPrice;
          })
        : null;

      // Get sessions for this event
      const eventSessions = sessionsByEventId[event.id] || [];

      // Assuming all sessions have the same capacity
      const capacity = eventSessions[0]?.capacity ?? 0;

      // Group sessions by date
      const sessionsByDate: Record<string, string[]> = {};
      eventSessions.forEach(session => {
        const date = formatDate(session.startsAt);
        const time = formatTime(session.startsAt);

        if (!sessionsByDate[date]) {
          sessionsByDate[date] = [];
        }
        sessionsByDate[date].push(time);
      });

      // Convert to array and sort
      const sessionDates = Object.entries(sessionsByDate)
        .map(([date, times]) => ({
          date,
          times: times.sort() // Sort times within each day
        }))
        .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date

      return {
        id: event.id,
        title: event.title,
        location: event.location,
        price: minPrice ? formatPrice(minPrice) : null,
        capacity,
        dates: sessionDates,
        sessions: eventSessions,
      };
    });
  }, [_trainingData, sessionsByEventId]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Название',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('location', {
        header: 'Место',
        cell: info => info.getValue() || 'Not specified',
      }),
      columnHelper.accessor('price', {
        header: 'Цена',
        cell: info => {
          return info.getValue() || 'N/A';
        },
      }),
      columnHelper.accessor('capacity', {
        header: 'Кол-во мест',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('dates', {
        header: 'Даты',
        cell: info => {
          const dates = info.getValue() as { date: string; times: string[] }[];
          if (!dates || dates.length === 0) {
            return <span>Даты не указаны</span>;
          }
          return (
            <div className={styles.dates}>
              {dates.slice(0, 3).map((dateGroup, index) => (
                <div key={index} className={styles.date}>
                  <div className={styles.dateDay}>{dateGroup.date}</div>
                  <div className={styles.dateTimes}>{dateGroup.times.join(' / ')}</div>
                </div>
              ))}
              {dates.length > 3 && (
                <div className={styles.date}>
                  <div className={styles.dateTime}>+{dates.length - 3} ещё дней</div>
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        cell: info => (
          <IconButton
            src={PencilSimpleBold}
            type="secondary"
            size="s"
            onClick={() => handleEdit?.(info.row.original.id)}
          />
        ),
      }),
    ],
    []
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: trainingData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  // Infinite scroll detection
  useEffect(() => {
    const container = bodyContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      console.log('scrolling');
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (trainingLoading || sessionsLoading) {
    return <div className={styles.loading}>Loading training data...</div>;
  }

  if (trainingError || sessionsError) {
    return <div className={styles.error}>Error loading training data</div>;
  }

  return (
    <div className={clsx(className, styles.tableContainer)} ref={tableContainerRef}>
      {/* Fixed Header */}
      <div className={styles.headerContainer}>
        {table.getHeaderGroups().map(headerGroup => (
          <div key={headerGroup.id} className={styles.gridHeader}>
            {headerGroup.headers.map(header => (
              <div
                key={header.id}
                className={clsx(
                  styles.headerCell,
                  styles[`headerCell${capitalize(header.id, true)}`],
                  header.column.getCanSort() && styles.headerCellSortable
                )}
                onClick={header.column.getToggleSortingHandler()}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {header.column.getCanSort() && (
                  <Icon
                    className={clsx(styles.sortIndicator, header.column.getIsSorted() && styles.sortIndicatorActive)}
                    src={header.column.getIsSorted() === 'asc' ? ArrowUpBold : ArrowDownBold}
                    width={16}
                    height={16}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Scrollable Body */}
      <div className={styles.bodyContainer} ref={bodyContainerRef}>
        <div className={styles.gridBody}>
          {rows.map(row => (
            <div key={row.id} className={styles.gridRow}>
              {row.getVisibleCells().map(cell => (
                <div
                  key={cell.id}
                  className={clsx(styles.cell, styles[`cell${capitalize(cell.column.id, true)}`])}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Loading state for pagination */}
        {isFetchingNextPage && (
          <div className={styles.paginationLoading}>
            Loading more trainings...
          </div>
        )}

        {/* End of list indicator */}
        {!hasNextPage && trainingData.length > 0 && (
          <div className={styles.endOfList}>
            No more trainings to load
          </div>
        )}
      </div>
    </div>
  );
}