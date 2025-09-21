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
import { Button } from '@/shared/ui';
import { useEvents, type Event } from '@/shared/api';
import { SessionDates } from './components/SessionDates';
import { TotalSeats } from './components/TotalSeats';
import styles from './TrainingsTable.module.scss';

type TrainingRowData = {
  id: string;
  title: string;
  location: string | null | undefined;
  price: number | null;
  event: Event;
};

type TrainingsTableProps = React.HTMLAttributes<HTMLDivElement>;

const columnHelper = createColumnHelper<TrainingRowData>();

export function TrainingsTable({ className }: TrainingsTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useEvents({
    'labels.any': ['training'],
    limit: 100,
  });

  const trainingData = useMemo(() => {
    if (!eventsData?.items) return [];

    return eventsData.items.map((event) => {
      const minPrice = event.tickets.length > 0
        ? Math.min(...event.tickets.map(ticket =>
            ticket.prepayment ? ticket.prepayment.price.amountMinor / 100 : ticket.full.price.amountMinor / 100
          ))
        : null;

      return {
        id: event.id,
        title: event.title,
        location: event.location,
        price: minPrice,
        event,
      };
    });
  }, [eventsData]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('location', {
        header: 'Location',
        cell: info => info.getValue() || 'Not specified',
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: info => {
          const price = info.getValue();
          return price ? `$${price}` : 'N/A';
        },
      }),
      columnHelper.display({
        id: 'totalSeats',
        header: 'Total Seats',
        cell: info => <TotalSeats event={info.row.original.event} />,
      }),
      columnHelper.display({
        id: 'sessionDates',
        header: 'Session Dates',
        cell: info => <SessionDates event={info.row.original.event} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <Button
            type="secondary"
            size="s"
            onClick={() => handleEdit(info.row.original.id)}
          >
            Edit
          </Button>
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

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  const handleEdit = (eventId: string) => {
    console.log('Edit event:', eventId);
  };

  if (eventsLoading) {
    return <div className={styles.loading}>Loading training events...</div>;
  }

  if (eventsError) {
    return <div className={styles.error}>Error loading training events</div>;
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
                  className={styles.th}
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
          <tr style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            <td colSpan={columns.length} style={{ position: 'relative' }}>
              {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const row = rows[virtualRow.index];
                return (
                  <div
                    key={row.id}
                    className={styles.virtualRow}
                    style={{
                      position: 'absolute',
                      top: `${virtualRow.start}px`,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      display: 'flex',
                    }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <div
                        key={cell.id}
                        className={styles.virtualCell}
                        style={{
                          flex: cell.column.getSize(),
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                );
              })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}