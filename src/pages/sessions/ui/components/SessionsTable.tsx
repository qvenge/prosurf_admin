import { useMemo, useRef, useState } from 'react';
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
import { CaretRightBold } from '@/shared/ds/icons';
import { IconButton, SideModal } from '@/shared/ui';
import { capitalize } from '@/shared/lib/string';
import { useSessions, type Session } from '@/shared/api';
import { formatDate, formatTime, formatPrice } from '@/shared/lib/format-utils';
import styles from './SessionsTable.module.scss';
import { SessionDetails } from './SessionDetails';

type SessionRowData = {
  id: string;
  title: string;
  location: string | null | undefined;
  price: string | null;
  occupied: string;
  startsAt: string;
};

interface SessionsTableProps extends React.HTMLAttributes<HTMLDivElement> {}

const columnHelper = createColumnHelper<SessionRowData>();

export function SessionsTable({ className }: SessionsTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [openedSession, setOpenedSession] = useState<string | null>(null);

  const { data: _sessionsData, isLoading: sessionsLoading, error: sessionsError } = useSessions({
    limit: 10,
  });

  const sessionsData = useMemo(() => {
    if (!_sessionsData?.items) return [];

    return _sessionsData.items.map((session: Session) => {
      const event = session.event;
      const minPrice = event.tickets.length > 0
        ? event.tickets.map(ticket => ticket.full.price).reduce((minPrice, price) => {
            return price.amountMinor < minPrice.amountMinor ? price : minPrice;
          })
        : null;

      return {
        id: session.id,
        title: event.title,
        location: event.location,
        price: minPrice ? formatPrice(minPrice) : null,
        occupied: `${session.capacity - session.remainingSeats} из ${session.capacity}`,
        startsAt: session.startsAt,
      };
    });
  }, [_sessionsData]);

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
          <IconButton
            src={CaretRightBold}
            type="secondary"
            size="s"
            onClick={() => handleEdit(info.row.original.id)}
          />
        ),
      }),
    ],
    [_sessionsData]
  );

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
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  const handleEdit = (eventId: string) => {
    setOpenedSession(eventId);
  };

  if (sessionsLoading) {
    return <div className={styles.loading}>Loading training sessions...</div>;
  }

  if (sessionsError) {
    return <div className={styles.error}>Error loading training sessions</div>;
  }

  return (
    <div className={clsx(className, styles.tableContainer)} ref={tableContainerRef}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className={clsx(styles.th, styles[`th${capitalize(header.id, true)}`])}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() && (
                    <span className={styles.sortIndicator}>
                      {header.column.getIsSorted() === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className={styles.tbody}>
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const row = rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                className={styles.virtualRow}
                style={{
                  width: '100%',  
                  position: 'relative',
                  height: `${virtualRow.size}px`,
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className={clsx(styles.td, styles[`td${capitalize(cell.column.id, true)}`])}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {openedSession != null && <SideModal onClose={() => setOpenedSession(null)}>
        <SessionDetails sessionId={openedSession} />
      </SideModal>}
    </div>
  );
}