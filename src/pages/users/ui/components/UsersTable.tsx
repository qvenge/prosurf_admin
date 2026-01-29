import { useMemo } from 'react';
import { Link } from 'react-router';
import { CaretRightBold } from '@/shared/ds/icons';
import { DataTable, IconButton, UserCell, type ColumnDef, type SortCriterion } from '@/shared/ui';
import type { Client, ClientSeasonTicketSummary } from '@/shared/api';
import { formatDate, formatDateUTC, formatTime } from '@/shared/lib/format-utils';
import styles from './UsersTable.module.scss';

type UserRowData = {
  id: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdDate: string;
  createdTime: string;
  phone?: string | null;
  email?: string | null;
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
      firstName: item.firstName,
      lastName: item.lastName,
      dateOfBirth: item.dateOfBirth ? formatDateUTC(item.dateOfBirth) : undefined,
      photoUrl: item.photoUrl,
      phone: item.phone,
      email: item.email,
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
        <UserCell
          user={{ firstName: item.firstName, lastName: item.lastName, photoUrl: item.photoUrl }}
          secondaryText={item.dateOfBirth}
          fallbackName={item.username || undefined}
        />
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
          {item.phone && <div className={styles.contactsPhone}>{item.phone}</div>}
          {item.email && <div className={styles.contactsEmail}>{item.email}</div>}
          {!item.phone && !item.email && '—'}
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
