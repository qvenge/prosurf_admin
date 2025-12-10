import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CaretRightBold } from '@/shared/ds/icons';
import { DataTable, Pagination, IconButton, type ColumnDef } from '@/shared/ui';
import { useClientsAdmin } from '@/shared/api/hooks/admin';
import type { Client, ClientSeasonTicketSummary } from '@/shared/api';
import { formatDate, formatTime } from '@/shared/lib/format-utils';
import styles from './UsersTable.module.scss';

type UserRowData = {
  id: string;
  telegramId: Client['telegramId'];
  name: string;
  createdDate: string;
  createdTime: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  photoUrl?: string | null;
  seasonTicketSummary?: ClientSeasonTicketSummary;
};

export interface UsersTableProps extends React.HTMLAttributes<HTMLDivElement> {
  handleEdit?: (clientId: string) => void;
}

export function UsersTable({ className, handleEdit }: UsersTableProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useClientsAdmin({
    page,
    limit: 20,
  });

  // Transform data for display
  const usersData: UserRowData[] = useMemo(() => {
    if (!data?.items) return [];

    return data.items.map((item: Client) => ({
      id: item.id,
      telegramId: item.telegramId,
      name: [item.lastName, item.firstName].filter(Boolean).join(' ') || item.username || 'Без имени',
      dateOfBirth: item.dateOfBirth ? formatDate(item.dateOfBirth) : undefined,
      photoUrl: item.photoUrl,
      phone: item.phone,
      createdDate: formatDate(item.createdAt),
      createdTime: formatTime(item.createdAt),
      seasonTicketSummary: item.seasonTicketSummary,
    }));
  }, [data]);

  const columns: ColumnDef<UserRowData>[] = useMemo(() => [
    {
      id: 'personalInfo',
      label: 'Личные данные',
      render: (item) => (
        <div className={styles.personalInfoContainer}>
          {item.photoUrl ? (
            <img src={item.photoUrl} alt="User Avatar" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder} />
          )}
          <div className={styles.personalInfo}>
            <div className={styles.name}>{item.name}</div>
            {item.dateOfBirth && (
              <div className={styles.dateOfBirth}>{item.dateOfBirth}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'seasonTicket',
      label: 'Абонемент',
      render: (item) => {
        const summary = item.seasonTicketSummary;

        if (!summary || summary.activeCount === 0) {
          return (
            <div className={styles.seasonTicket}>
              <div className={styles.seasonTicketSeats}>—</div>
            </div>
          );
        }

        return (
          <div className={styles.seasonTicket}>
            <Link
              to={`/season-tickets?clientId=${item.id}`}
              className={styles.seasonTicketLink}
            >
              {summary.remainingPasses} из {summary.totalPasses}
            </Link>
          </div>
        );
      },
    },
    {
      id: 'contacts',
      label: 'Контакты',
      render: (item) => (
        <div className={styles.contacts}>
          {item.phone && (
            <div className={styles.contactsPhone}>{item.phone}</div>
          )}
        </div>
      ),
    },
    {
      id: 'telegramId',
      label: 'Telegram ID',
      render: (item) => item.telegramId,
    },
    {
      id: 'created',
      label: 'Дата регистрации',
      render: (item) => (
        <div className={styles.created}>
          <div className={styles.createdDate}>{item.createdDate}</div>
          <div className={styles.createdTime}>{item.createdTime}</div>
        </div>
      ),
    },
    {
      id: 'actions',
      label: '',
      width: '80px',
      align: 'right',
      render: (item) => (
        <IconButton
          className={styles.editButton}
          src={CaretRightBold}
          type="secondary"
          size="s"
          onClick={() => handleEdit?.(item.id)}
        />
      ),
    },
  ], [handleEdit]);

  if (error) {
    return <div className={styles.error}>Ошибка загрузки данных</div>;
  }

  return (
    <div className={className}>
      <DataTable
        columns={columns}
        data={usersData}
        isLoading={isLoading}
        emptyMessage="Нет клиентов"
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
