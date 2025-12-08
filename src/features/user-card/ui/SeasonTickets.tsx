import { useState, useRef } from 'react';
import type { Client } from '@/shared/api';
import { useClientSeasonTickets, useCancelSeasonTicket, useSeasonTicketPlans, useGrantSeasonTicket } from '@/shared/api';
import { Dropdown, Loader, Icon, IconButton, Button } from '@/shared/ui';
import { PlusBold, CaretDownBold, ArrowCounterClockwiseRegular } from '@/shared/ds/icons';
import { SeasonTicketCard } from './SeasonTicketCard';
import styles from './SeasonTickets.module.scss';

export interface SeasonTicketsProps {
  client: Client;
}

export function SeasonTickets({ client }: SeasonTicketsProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [pendingAdditions, setPendingAdditions] = useState<Array<{ key: string; id: string; name: string }>>([]);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownToggleRef = useRef<HTMLButtonElement>(null!);

  const { data: ticketsData, isLoading, error } = useClientSeasonTickets(client.id);
  const { data: plansData, isLoading: plansLoading } = useSeasonTicketPlans();
  const { mutateAsync: cancelTicket } = useCancelSeasonTicket();
  const { mutateAsync: grantTicket } = useGrantSeasonTicket();

  const handleCancel = (ticketId: string) => {
    setPendingDeletions((prev) => [...prev, ticketId]);
  };

  const handleUndoCancel = (ticketId: string) => {
    setPendingDeletions((prev) => prev.filter((id) => id !== ticketId));
  };

  const handleGrant = (planId: string, planName: string) => {
    setPendingAdditions((prev) => [...prev, { key: crypto.randomUUID(), id: planId, name: planName }]);
    setDropdownOpen(false);
  };

  const handleUndoGrant = (key: string) => {
    setPendingAdditions((prev) => prev.filter((p) => p.key !== key));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const ticketId of pendingDeletions) {
        await cancelTicket(ticketId);
      }
      for (const addition of pendingAdditions) {
        await grantTicket({ clientId: client.id, data: { planId: addition.id } });
      }
      setPendingAdditions([]);
      setPendingDeletions([]);
    } finally {
      setIsSaving(false);
    }
  };

  const hasPendingChanges = pendingAdditions.length > 0 || pendingDeletions.length > 0;

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
  const hasTickets = activeTickets.length > 0 || pendingAdditions.length > 0;

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        {hasTickets ? (
          <>
            <div className={styles.ticketsList}>
              {activeTickets.map((ticket) => (
                <SeasonTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  isDeleted={pendingDeletions.includes(ticket.id)}
                  disabled={isSaving}
                  onDelete={() => handleCancel(ticket.id)}
                  onRestore={() => handleUndoCancel(ticket.id)}
                />
              ))}
              {pendingAdditions.map((addition) => (
                <div key={addition.key} className={`${styles.ticketRow} ${styles.ticketPending}`}>
                  <div className={styles.ticketField}>
                    <span className={styles.ticketName}>{addition.name}</span>
                  </div>
                  <IconButton
                    type="secondary"
                    size="l"
                    src={ArrowCounterClockwiseRegular}
                    onClick={() => handleUndoGrant(addition.key)}
                    disabled={isSaving}
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
                disabled={plansLoading || isSaving}
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
                    onClick={() => handleGrant(plan.id, plan.name)}
                    disabled={isSaving}
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
                disabled={plansLoading || isSaving}
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
                    onClick={() => handleGrant(plan.id, plan.name)}
                    disabled={isSaving}
                  >
                    {plan.name}
                  </button>
                ))}
              </Dropdown>
            </div>
          </>
        )}
      </div>
      <Button
        type="primary"
        size="l"
        streched
        onClick={handleSave}
        disabled={!hasPendingChanges || isSaving}
      >
        Сохранить
      </Button>
    </div>
  );
}
