import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { PencilSimpleBold } from '@/shared/ds/icons';
import { IconButton } from '@/shared/ui';
import { EventSessionDates } from '../ui';
import { type EventRowData } from './useEventsData';

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
      columnHelper.display({
        id: 'dates',
        header: 'Даты',
        cell: info => (
          <EventSessionDates eventId={info.row.original.id} />
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