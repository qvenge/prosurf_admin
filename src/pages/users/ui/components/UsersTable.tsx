import { useMemo } from 'react';
import { Link } from 'react-router';
import { CaretRightBold } from '@/shared/ds/icons';
import { DataTable, IconButton, type ColumnDef, type SortCriterion } from '@/shared/ui';
import type { Client, ClientSeasonTicketSummary } from '@/shared/api';
import { formatDate, formatTime } from '@/shared/lib/format-utils';
import styles from './UsersTable.module.scss';

type UserRowData = {
  id: string;
  username?: string | null;
  name: string;
  createdDate: string;
  createdTime: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  photoUrl?: string | null;
  seasonTicketSummary?: ClientSeasonTicketSummary;
};

export interface UsersTableProps {
  className?: string;
  data: Client[];
  isLoading: boolean;
  sort: SortCriterion[];
  onSortChange: (sort: SortCriterion[]) => void;
  handleEdit?: (clientId: string) => void;
}

export function UsersTable({
  className,
  data,
  isLoading,
  sort,
  onSortChange,
  handleEdit,
}: UsersTableProps) {
  // Transform data for display
  const usersData: UserRowData[] = useMemo(() => {
    return data.map((item: Client) => ({
      id: item.id,
      username: item.username,
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
      sortable: true,
      sortKey: 'firstName',
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
      id: 'telegram',
      label: 'Telegram',
      sortable: true,
      sortKey: 'username',
      render: (item) => item.username ? (
        <a
          href={`https://t.me/${item.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.telegramLink}
        >
          @{item.username}
        </a>
      ) : '—',
    },
    {
      id: 'contacts',
      label: 'Контакты',
      sortable: true,
      sortKey: 'phone',
      render: (item) => (
        <div className={styles.contacts}>
          {item.phone ? (
            <div className={styles.contactsPhone}>{item.phone}</div>
          ) : '—'}
        </div>
      ),
    },
    {
      id: 'seasonTicket',
      label: 'Абонемент',
      sortable: true,
      sortKey: 'seasonTicketPasses',
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
      id: 'created',
      label: 'Дата регистрации',
      sortable: true,
      sortKey: 'createdAt',
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

  return (
    <div className={className}>
      <DataTable
        columns={columns}
        data={usersData}
        isLoading={isLoading}
        emptyMessage="Нет клиентов"
        getRowKey={(item) => item.id}
        sort={sort}
        onSortChange={onSortChange}
      />
    </div>
  );
}
