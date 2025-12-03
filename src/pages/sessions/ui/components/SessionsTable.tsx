import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDownBold, ArrowUpBold, CaretRightBold, TrashBold } from '@/shared/ds/icons';
import { Icon, IconButton, SideModal, Modal, Button } from '@/shared/ui';
import { capitalize } from '@/shared/lib/string';
import { useSessionsInfinite, useDeleteSession, type Session } from '@/shared/api';
import { formatDate, formatTime, formatPrice } from '@/shared/lib/format-utils';
import styles from './SessionsTable.module.scss';
import { SessionDetails } from './SessionDetails';

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

const columnHelper = createColumnHelper<SessionRowData>();

export function SessionsTable({ className, eventType, eventId }: SessionsTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const bodyContainerRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const openedSession = searchParams.get('sessionId');
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

  const {
    data: _sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useSessionsInfinite({
    limit: 15,
    'labels.any': eventType ? [eventType] : undefined,
    eventId: eventId || undefined,
  });

  const sessionsData = useMemo(() => {
    if (!_sessionsData?.pages) return [];

    const allSessions = _sessionsData.pages.flatMap(page => page.items);

    return allSessions.map((session: Session) => {
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
  }, [_sessionsData]);

  const handleEdit = useCallback((sessionId: string) => {
    searchParams.set('sessionId', sessionId);
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Название',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('status', {
        header: 'Статус',
        cell: info => {
          const status = info.getValue();
          const labels: Record<string, string> = {
            SCHEDULED: 'Запланировано',
            CANCELLED: 'Отменено',
            COMPLETE: 'Завершено',
          };
          return status ? (
            <span className={styles[`status${status}`]}>{labels[status] ?? status}</span>
          ) : null;
        },
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
      columnHelper.accessor('occupied', {
        header: 'Записи',
        cell: info => info.getValue(),
      }),
      columnHelper.display({
        id: 'datetime',
        header: 'Дата',
        cell: (info) => {
          const date = formatDate(info.row.original.startsAt);
          const time = formatTime(info.row.original.startsAt);
          return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={styles.date}>{date}</span>
              <span className={styles.time}>{time}</span>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        cell: info => (
          <>
            <IconButton
              src={TrashBold}
              type="secondary"
              size="s"
              onClick={() => handleDelete(info.row.original.id)}
            />
            <IconButton
              src={CaretRightBold}
              type="secondary"
              size="s"
              onClick={() => handleEdit(info.row.original.id)}
            />
          </>
        ),
      }),
    ],
    [handleEdit]
  );

  const sessionToDeleteData = sessionsData.find(s => s.id === sessionToDelete);

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: sessionsData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => bodyContainerRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  // Infinite scroll detection
  useEffect(() => {
    const container = bodyContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (sessionsLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (sessionsError) {
    return <div className={styles.error}>Ошибка загрузки сеансов</div>;
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
        <div
          className={styles.gridBody}
          style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
        >
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={row.id}
                className={styles.gridRow}
                style={{
                  width: '100%',
                  position: 'absolute',
                  top: `${virtualRow.start}px`,
                  // height: `${virtualRow.size}px`,
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <div
                    key={cell.id}
                    className={clsx(styles.cell, styles[`cell${capitalize(cell.column.id, true)}`])}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Loading state for pagination */}
        {isFetchingNextPage && (
          <div className={styles.paginationLoading}>
            Загрузка сеансов...
          </div>
        )}

        {/* End of list indicator */}
        {!hasNextPage && sessionsData.length > 0 && (
          <div className={styles.endOfList}>
            Все сеансы загружены
          </div>
        )}
      </div>

      {openedSession != null && <SideModal onClose={() => {
        searchParams.delete('sessionId');
        setSearchParams(searchParams);
      }}>
        <SessionDetails sessionId={openedSession} />
      </SideModal>}

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
    </div>
  );
}