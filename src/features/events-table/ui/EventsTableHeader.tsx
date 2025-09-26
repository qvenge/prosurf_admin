import { flexRender, type Table } from '@tanstack/react-table';
import clsx from 'clsx';
import { ArrowDownBold, ArrowUpBold } from '@/shared/ds/icons';
import { Icon } from '@/shared/ui';
import { capitalize } from '@/shared/lib/string';
import { type EventRowData } from '../lib/useEventsData';
import styles from './EventsTable.module.scss';

interface EventsTableHeaderProps {
  table: Table<EventRowData>;
}

export function EventsTableHeader({ table }: EventsTableHeaderProps) {
  return (
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
  );
}