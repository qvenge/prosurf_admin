import { useMemo } from 'react';
import { DataTable, IconButton, type ColumnDef, type SortCriterion } from '@/shared/ui';
import { TrashBold } from '@/shared/ds/icons';
import { formatDate } from '@/shared/lib/format-utils';
import { OwnerCell } from './OwnerCell';
import type { SeasonTicketAdmin } from '@/shared/api';
import styles from './SeasonTicketsTable.module.scss';

interface SeasonTicketsTableProps {
  className?: string;
  data: SeasonTicketAdmin[];
  isLoading: boolean;
  sort: SortCriterion[];
  onSortChange: (sort: SortCriterion[]) => void;
  onCancel: (ticket: SeasonTicketAdmin) => void;
  onPlanClick: (planId: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Активен',
  EXPIRED: 'Истёк',
  CANCELLED: 'Отменён',
};

export function SeasonTicketsTable({
  className,
  data,
  isLoading,
  sort,
  onSortChange,
  onCancel,
  onPlanClick,
}: SeasonTicketsTableProps) {
  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const columns: ColumnDef<SeasonTicketAdmin>[] = useMemo(
    () => [
      {
        id: 'owner',
        label: 'Владелец',
        sortable: true,
        sortKey: 'ownerName',
        render: (ticket) => <OwnerCell owner={ticket.owner} />,
      },
      {
        id: 'status',
        label: 'Статус',
        sortable: true,
        sortKey: 'status',
        render: (ticket) => (
          <span className={`${styles.status} ${styles[`status${ticket.status}`]}`}>
            {STATUS_LABELS[ticket.status] || ticket.status}
          </span>
        ),
      },
      {
        id: 'passes',
        label: 'Посещения',
        sortable: true,
        sortKey: 'remainingPasses',
        render: (ticket) => (
          <span
            className={`${styles.passes} ${ticket.remainingPasses === 0 ? styles.noPasses : ''}`}
          >
            {ticket.remainingPasses} / {ticket.totalPasses}
          </span>
        ),
      },
      {
        id: 'plan',
        label: 'План',
        render: (ticket) => (
          <span
            className={styles.planLink}
            onClick={(e) => {
              e.stopPropagation();
              onPlanClick(ticket.plan.id);
            }}
          >
            {ticket.plan.name}
          </span>
        ),
      },
      {
        id: 'createdAt',
        label: 'Дата покупки',
        sortable: true,
        sortKey: 'createdAt',
        render: (ticket) => formatDate(ticket.createdAt),
      },
      {
        id: 'validUntil',
        label: 'Действителен до',
        sortable: true,
        sortKey: 'validUntil',
        render: (ticket) => (
          <span className={isExpired(ticket.validUntil) ? styles.expired : ''}>
            {formatDate(ticket.validUntil)}
          </span>
        ),
      },
      {
        id: 'actions',
        label: '',
        align: 'right',
        width: '60px',
        render: (ticket) => (
          <div className={styles.actions}>
            <IconButton
              src={TrashBold}
              type="secondary"
              size="s"
              onClick={() => onCancel(ticket)}
              disabled={ticket.status !== 'ACTIVE'}
            />
          </div>
        ),
      },
    ],
    [onCancel, onPlanClick]
  );

  return (
    <DataTable
      className={className}
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage="Нет абонементов"
      getRowKey={(ticket) => ticket.id}
      sort={sort}
      onSortChange={onSortChange}
    />
  );
}
