import { forwardRef } from 'react';
import { type Table } from '@tanstack/react-table';
import { type EventRowData } from '../lib/useEventsData';
import { EventsTableRow } from './EventsTableRow';
import styles from './EventsTable.module.scss';

interface EventsTableBodyProps {
  table: Table<EventRowData>;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  eventsCount: number;
}

export const EventsTableBody = forwardRef<HTMLDivElement | null, EventsTableBodyProps>(
  ({ table, isFetchingNextPage, hasNextPage, eventsCount }, ref) => {
    const { rows } = table.getRowModel();

    return (
      <div className={styles.bodyContainer} ref={ref}>
        <div className={styles.gridBody}>
          {rows.map(row => (
            <EventsTableRow key={row.id} row={row} />
          ))}
        </div>

        {/* Loading state for pagination */}
        {isFetchingNextPage && (
          <div className={styles.paginationLoading}>
            Loading more trainings...
          </div>
        )}

        {/* End of list indicator */}
        {!hasNextPage && eventsCount > 0 && (
          <div className={styles.endOfList}>
            No more trainings to load
          </div>
        )}
      </div>
    );
  }
);

EventsTableBody.displayName = 'EventsTableBody';