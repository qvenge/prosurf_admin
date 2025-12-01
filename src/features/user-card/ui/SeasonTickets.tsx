import { useState } from 'react';
import type { Client } from '@/shared/api';
import { useClientSeasonTickets, useCancelSeasonTicket } from '@/shared/api';
import { TextButton, Loader } from '@/shared/ui';
import { GrantSeasonTicketModal } from './GrantSeasonTicketModal';
import { SeasonTicketCard } from './SeasonTicketCard';
import styles from './SeasonTickets.module.scss';

export interface SeasonTicketsProps {
  client: Client;
}

export function SeasonTickets({ client }: SeasonTicketsProps) {
  const [isGrantModalOpen, setGrantModalOpen] = useState(false);
  const { data: ticketsData, isLoading, error } = useClientSeasonTickets(client.id);
  const { mutate: cancelTicket, isPending: isCancelling } = useCancelSeasonTicket();

  const handleCancel = (ticketId: string) => {
    if (confirm('Вы уверены, что хотите отменить этот абонемент?')) {
      cancelTicket(ticketId);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>Ошибка загрузки абонементов</div>;
  }

  const ticketsList = ticketsData?.items ?? [];

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Абонементы</h3>
        <TextButton
          type="primary"
          size="s"
          onClick={() => setGrantModalOpen(true)}
        >
          + Добавить
        </TextButton>
      </div>

      {ticketsList.length === 0 ? (
        <div className={styles.empty}>Нет абонементов</div>
      ) : (
        <div className={styles.list}>
          {ticketsList.map((ticket) => (
            <SeasonTicketCard
              key={ticket.id}
              ticket={ticket}
              onCancel={() => handleCancel(ticket.id)}
              isCancelling={isCancelling}
            />
          ))}
        </div>
      )}

      {isGrantModalOpen && (
        <GrantSeasonTicketModal
          client={client}
          onClose={() => setGrantModalOpen(false)}
        />
      )}
    </div>
  );
}
