import { useMemo, useState } from 'react';
import { PencilSimpleBold, TrashBold } from '@/shared/ds/icons';
import { DataTable, Pagination, IconButton, type ColumnDef } from '@/shared/ui';
import { useSeasonTicketPlansAdmin } from '@/shared/api/hooks/admin';
import type { SeasonTicketPlan } from '@/shared/api';
import { pluralize } from '@/shared/lib/string';
import { formatPrice } from '@/shared/lib/format-utils';
import styles from './PlansTable.module.scss';

type PlanRowData = {
  id: string;
  name: string;
  passes: number;
  price: string;
  endsIn: string;
  description?: string | null;
  isSystemPlan: boolean;
  original: SeasonTicketPlan;
};

export interface PlansTableProps extends React.HTMLAttributes<HTMLDivElement> {
  handleEdit?: (plan: SeasonTicketPlan) => void;
  handleDelete?: (plan: SeasonTicketPlan) => void;
}

export function PlansTable({ className, handleEdit, handleDelete }: PlansTableProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useSeasonTicketPlansAdmin({
    page,
    limit: 20,
    includeSystem: true,
  });

  // Transform data for display
  const plansData: PlanRowData[] = useMemo(() => {
    if (!data?.items) return [];

    return data.items.map((seasonTicket: SeasonTicketPlan) => {
      const expiresInMonths = Math.round(seasonTicket.expiresIn / (30 * 24 * 60 * 60 * 1000));
      const endsIn = expiresInMonths > 0 ? expiresInMonths : 12;

      return {
        id: seasonTicket.id,
        name: seasonTicket.name,
        passes: seasonTicket.passes,
        price: formatPrice(seasonTicket.price),
        endsIn: `${endsIn} ${pluralize(endsIn, ['месяц', 'месяца', 'месяцев'])}`,
        description: seasonTicket.description,
        isSystemPlan: seasonTicket.isSystemPlan,
        original: seasonTicket,
      };
    });
  }, [data]);

  const columns: ColumnDef<PlanRowData>[] = useMemo(() => [
    {
      id: 'name',
      label: 'Название',
      render: (item) => (
        <div className={styles.nameContainer}>
          <div className={styles.name}>{item.name}</div>
          {item.description && (
            <div className={styles.description}>{item.description}</div>
          )}
        </div>
      ),
    },
    {
      id: 'type',
      label: 'Тип',
      render: (item) => (
        <span className={item.isSystemPlan ? styles.systemBadge : styles.publicBadge}>
          {item.isSystemPlan ? 'Системный' : 'Публичный'}
        </span>
      ),
    },
    {
      id: 'passes',
      label: 'Кол-во занятий',
      render: (item) => item.passes,
    },
    {
      id: 'price',
      label: 'Цена',
      render: (item) => item.price,
    },
    {
      id: 'id',
      label: 'ID',
      render: (item) => item.id,
    },
    {
      id: 'endsIn',
      label: 'Срок действия',
      render: (item) => item.endsIn,
    },
    {
      id: 'actions',
      label: '',
      width: '100px',
      align: 'right',
      render: (item) => (
        <div className={styles.actionsButtons}>
          <IconButton
            src={PencilSimpleBold}
            type="secondary"
            size="s"
            onClick={() => handleEdit?.(item.original)}
          />
          <IconButton
            src={TrashBold}
            type="secondary"
            size="s"
            onClick={() => handleDelete?.(item.original)}
          />
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  if (error) {
    return <div className={styles.error}>Ошибка загрузки данных</div>;
  }

  return (
    <div className={className}>
      <DataTable
        columns={columns}
        data={plansData}
        isLoading={isLoading}
        emptyMessage="Нет планов абонементов"
        getRowKey={(item) => item.id}
      />
      {data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
