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
import { ArrowDownBold, ArrowUpBold, PencilSimpleBold, TrashBold } from '@/shared/ds/icons';
import { Icon, IconButton } from '@/shared/ui';
import { capitalize, pluralize } from '@/shared/lib/string';
import { useSeasonTicketPlansInfinite, type SeasonTicketPlan } from '@/shared/api';
import { formatPrice } from '@/shared/lib/format-utils';
import styles from './PlansTable.module.scss';

type PlanRowData = {
  id: string;
  name: string;
  passes: number;
  price: string;
  endsIn: string;
  description?: string | null;
};

export interface PlansTableProps extends React.HTMLAttributes<HTMLDivElement> {
  handleEdit?: (plan: SeasonTicketPlan) => void;
  handleDelete?: (plan: SeasonTicketPlan) => void;
}

const columnHelper = createColumnHelper<PlanRowData>();

export function PlansTable({ className, handleEdit, handleDelete }: PlansTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const bodyContainerRef = useRef<HTMLDivElement>(null);
  const [allSeasonTickets, setAllSeasonTickets] = useState<SeasonTicketPlan[]>([]);

  const {
    data: _plansData,
    isLoading: trainingLoading,
    error: trainingError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useSeasonTicketPlansInfinite({
    limit: 100
  });

  const plansData = useMemo(() => {
    if (!_plansData?.pages) return [];

    const _allSeasonTickets = _plansData.pages.flatMap(page => page.items);
    setAllSeasonTickets(_allSeasonTickets);

    return _allSeasonTickets.map((seasonTicket: SeasonTicketPlan) => {
      const endsIn = 12;

      return {
        id: seasonTicket.id,
        name: seasonTicket.name,
        passes: seasonTicket.passes,
        price: formatPrice(seasonTicket.price),
        endsIn: `${endsIn} ${pluralize(endsIn, ['месяц', 'месяца', 'месяцев'])}`,
        description: seasonTicket.description
      };
    });
  }, [_plansData]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'name',
        header: 'Название',
        cell: info => (
          <div className={styles.nameContainer}>
            <div className={styles.name}>{info.row.original.name}</div>
            <div className={styles.description}>{info.row.original.description}</div>
          </div>
        ),
      }),
      columnHelper.accessor('passes', {
        header: 'Кол-во занятий',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('price', {
        header: 'Цена',
        cell: info => info.getValue() || 'N/A'
      }),
      columnHelper.accessor('id', {
        header: 'ID',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('endsIn', {
        header: 'Срок действия',
        cell: info => info.getValue(),
      }),
      columnHelper.display({
        id: 'actions',
        cell: info => {
          const plan = allSeasonTickets.find(plan => plan.id === info.row.original.id);
          return (
            <div className={styles.actionsButtons}>
              <IconButton
                className={styles.editButton}
                src={PencilSimpleBold}
                type="secondary"
                size="s"
                onClick={() => {
                  if (plan && handleEdit) {
                    handleEdit(plan);
                  }
                }}
              />
              <IconButton
                className={styles.deleteButton}
                src={TrashBold}
                type="secondary"
                size="s"
                onClick={() => {
                  if (plan && handleDelete) {
                    handleDelete(plan);
                  }
                }}
              />
            </div>
          );
        },
      }),
    ],
    [handleEdit, handleDelete, allSeasonTickets]
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: plansData,
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
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

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
        {!hasNextPage && plansData.length > 0 && (
          <div className={styles.endOfList}>
            Все абонементы загружены
          </div>
        )}
      </div>
    </div>
  );
}
