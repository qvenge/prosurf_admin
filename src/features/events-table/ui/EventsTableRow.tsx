import { flexRender, type Row } from '@tanstack/react-table';
import clsx from 'clsx';
import { capitalize } from '@/shared/lib/string';
import { type EventRowData } from '../lib/useEventsData';
import styles from './EventsTable.module.scss';

interface EventsTableRowProps {
  row: Row<EventRowData>;
}

export function EventsTableRow({ row }: EventsTableRowProps) {
  return (
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
  );
}