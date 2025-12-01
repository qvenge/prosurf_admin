import { useState, useRef } from 'react';
import type { Client } from '@/shared/api';
import { useClientSeasonTickets, useCancelSeasonTicket, useSeasonTicketPlans, useGrantSeasonTicket } from '@/shared/api';
import { Dropdown, Loader, Icon, IconButton } from '@/shared/ui';
import { PlusBold, CaretDownBold, TrashRegular } from '@/shared/ds/icons';
import styles from './SeasonTickets.module.scss';

export interface SeasonTicketsProps {
  client: Client;
}

export function SeasonTickets({ client }: SeasonTicketsProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownToggleRef = useRef<HTMLButtonElement>(null);

  const { data: ticketsData, isLoading, error } = useClientSeasonTickets(client.id);
  const { data: plansData, isLoading: plansLoading } = useSeasonTicketPlans();
  const { mutate: cancelTicket, isPending: isCancelling } = useCancelSeasonTicket();
  const { mutate: grantTicket, isPending: isGranting } = useGrantSeasonTicket();

  const handleCancel = (ticketId: string) => {
    if (confirm('Вы уверены, что хотите отменить этот абонемент?')) {
      cancelTicket(ticketId);
    }
  };

  const handleGrant = (planId: string) => {
    grantTicket(
      { clientId: client.id, data: { planId } },
      {
        onSuccess: () => {
          setDropdownOpen(false);
        },
      }
    );
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
  const activeTickets = ticketsList.filter((t) => t.status === 'ACTIVE');
  const plans = plansData?.items ?? [];
  const hasTickets = activeTickets.length > 0;

  return (
    <div className={styles.root}>
      {hasTickets ? (
        <>
          <div className={styles.ticketsList}>
            {activeTickets.map((ticket) => (
              <div key={ticket.id} className={styles.ticketRow}>
                <div className={styles.ticketField}>
                  <span className={styles.ticketName}>{ticket.plan.name}</span>
                </div>
                <IconButton
                  type="secondary"
                  size="l"
                  src={TrashRegular}
                  onClick={() => handleCancel(ticket.id)}
                  disabled={isCancelling}
                />
              </div>
            ))}
          </div>

          <div className={styles.addButtonWrapper}>
            <button
              ref={dropdownToggleRef}
              type="button"
              className={styles.addButton}
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              disabled={plansLoading || isGranting}
            >
              <Icon src={PlusBold} width={20} height={20} />
              <span>Добавить еще</span>
              <Icon src={CaretDownBold} width={16} height={16} />
            </button>

            <Dropdown
              className={styles.dropdown}
              isOpen={isDropdownOpen}
              onClose={() => setDropdownOpen(false)}
              togglerRef={dropdownToggleRef}
            >
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => handleGrant(plan.id)}
                  disabled={isGranting}
                >
                  {plan.name}
                </button>
              ))}
            </Dropdown>
          </div>
        </>
      ) : (
        <>
          <p className={styles.emptyTitle}>Нет абонемента</p>

          <div className={styles.addButtonWrapper}>
            <button
              ref={dropdownToggleRef}
              type="button"
              className={styles.addButtonPressed}
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              disabled={plansLoading || isGranting}
            >
              <Icon src={PlusBold} width={20} height={20} />
              <span>Добавить</span>
              <Icon src={CaretDownBold} width={16} height={16} />
            </button>

            <Dropdown
              className={styles.dropdown}
              isOpen={isDropdownOpen}
              onClose={() => setDropdownOpen(false)}
              togglerRef={dropdownToggleRef}
            >
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => handleGrant(plan.id)}
                  disabled={isGranting}
                >
                  {plan.name}
                </button>
              ))}
            </Dropdown>
          </div>
        </>
      )}
    </div>
  );
}
