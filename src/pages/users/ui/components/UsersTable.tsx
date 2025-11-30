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
import { useClientsInfinite, type Client, type SeasonTicket } from '@/shared/api';
import { formatDate, formatTime } from '@/shared/lib/format-utils';
import styles from './UsersTable.module.scss';

type PlanRowData = {
  id: string; // telegramId is the id for clients
  telegramId: Client['telegramId'];
  name: string;
  seasonTickets: SeasonTicket[];
  createdDate: string;
  createdTime: string;
  phone?: string | null;
  email?: string;
  dateOfBirth?: string | null;
  photoUrl?: string | null;
};

export interface SessionsTableProps extends React.HTMLAttributes<HTMLDivElement> {
  handleEdit?: (client: Client) => void;
}

const columnHelper = createColumnHelper<PlanRowData>();

export function UsersTable({ className, handleEdit }: SessionsTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const bodyContainerRef = useRef<HTMLDivElement>(null);
  const [allItems, setAllItems] = useState<Client[]>([]);

  const {
    data: rawData,
    isLoading: trainingLoading,
    error: trainingError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useClientsInfinite({
    limit: 100
  });

  const normalizeFn = (item: Client): PlanRowData => {
    return {
      id: item.telegramId,
      telegramId: item.telegramId,
      name: [item.lastName, item.firstName].filter(Boolean).join(' ') || item.username || 'Без имени',
      dateOfBirth: item.dateOfBirth ? formatDate(item.dateOfBirth) : undefined,
      photoUrl: item.photoUrl,
      seasonTickets: [],
      phone: item.phone,
      createdDate: formatDate(item.createdAt),
      createdTime: formatTime(item.createdAt)
    };
  }

  const data = useMemo(() => {
    if (!rawData?.pages) return [];

    const _rawData = rawData.pages.flatMap((page: { items: Client[] }) => page.items);
    setAllItems(_rawData);

    return _rawData.map(normalizeFn);
  }, [rawData]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'personalInfo',
        header: 'Личные данные',
        cell: info => (
          <div className={styles.personalInfoContainer}>
            {info.row.original.photoUrl ? (
              <img src={info.row.original.photoUrl} alt="User Avatar" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder} />
            )}
            <div className={styles.personalInfo}>
              <div className={styles.name}>{info.row.original.name}</div>
              {info.row.original.dateOfBirth && (
                <div className={styles.dateOfBirth}>{info.row.original.dateOfBirth}</div>
              )}
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'seasonTicket',
        header: 'Абонемент',
        cell: () => (
          <div className={styles.seasonTicket}>
            <div className={styles.seasonTicketSeats}>—</div>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'contacts',
        header: 'Контакты',
        cell: (info) => (
          <div className={styles.contacts}>
            {info.row.original.phone && (
              <div className={styles.contactsPhone}>{info.row.original.phone}</div>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('telegramId', {
        header: 'Telegram ID',
        cell: info => info.getValue(),
      }),
      columnHelper.display({
        id: 'created',
        header: 'Дата регистрации',
        cell: (info) => (
          <div className={styles.created}>
            <div className={styles.createdDate}>{info.row.original.createdDate}</div>
            <div className={styles.createdTime}>{info.row.original.createdTime}</div>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        cell: info => (
          <IconButton
            className={styles.editButton}
            src={PencilSimpleBold}
            type="secondary"
            size="s"
            onClick={() => {
              const client = allItems.find(c => c.telegramId === info.row.original.telegramId);

              if (client && handleEdit) {
                handleEdit(client);
              }
            }}
          />
        ),
      }),
    ],
    [handleEdit, allItems]
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
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
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (trainingLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (trainingError) {
    return <div className={styles.error}>Ошибка загрузки данных</div>;
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
            Загрузка...
          </div>
        )}

        {/* End of list indicator */}
        {!hasNextPage && data.length > 0 && (
          <div className={styles.endOfList}>
            Все клиенты загружены
          </div>
        )}
      </div>
    </div>
  );
}
