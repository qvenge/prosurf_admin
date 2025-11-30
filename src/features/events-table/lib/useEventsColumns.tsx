import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Link } from 'react-router';
import { PencilSimpleBold } from '@/shared/ds/icons';
import { IconButton } from '@/shared/ui';
import { type EventRowData } from './useEventsData';
import styles from '../ui/EventsTable.module.scss'

const columnHelper = createColumnHelper<EventRowData>();

interface UseEventsColumnsProps {
  handleEdit?: (eventId: string) => void;
}

export function useEventsColumns({ handleEdit }: UseEventsColumnsProps) {
  return useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Название',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('location', {
        header: 'Место',
        cell: info => info.getValue() || 'Not specified',
      }),
      columnHelper.display({
        id: 'price',
        header: 'Цена',
        cell: info => (
          <div className={styles.priceContainer}>
            <div className={styles.price}>{info.row.original.price}</div>
            {info.row.original.prepayment && (
              <div className={styles.prepayment}>{info.row.original.prepayment}</div>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('capacity', {
        header: 'Кол-во мест',
        cell: info => info.getValue(),
      }),
      columnHelper.display({
        id: 'dates',
        header: 'Сеансы',
        cell: info => (
          <Link className={styles.link} to={`/sessions?eventId=${info.row.original.id}`}>
              Перейти
          </Link>
        ),
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
    [handleEdit]
  );
}