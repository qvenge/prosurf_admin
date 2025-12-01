import { useState } from 'react';
import type { Client } from '@/shared/api';
import { useSeasonTicketPlans, useGrantSeasonTicket } from '@/shared/api';
import { SideModal, Select, TextButton, Loader } from '@/shared/ui';
import styles from './GrantSeasonTicketModal.module.scss';

interface GrantSeasonTicketModalProps {
  client: Client;
  onClose: () => void;
}

export function GrantSeasonTicketModal({ client, onClose }: GrantSeasonTicketModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const { data: plansData, isLoading: plansLoading } = useSeasonTicketPlans();
  const { mutate: grantTicket, isPending: isGranting, error } = useGrantSeasonTicket();

  const plans = plansData?.items ?? [];

  const planOptions = plans.map((plan) => ({
    value: plan.id,
    label: `${plan.name} (${plan.passes} проходов, ${plan.expiresIn} дней)`,
  }));

  const handleGrant = () => {
    if (!selectedPlanId) return;

    grantTicket(
      { clientId: client.id, data: { planId: selectedPlanId } },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <SideModal onClose={onClose}>
      <div className={styles.content}>
        <h2 className={styles.title}>Выдать абонемент</h2>

        <p className={styles.description}>
          Выберите план абонемента для {client.firstName || client.username || 'пользователя'}
        </p>

        {plansLoading ? (
          <div className={styles.loading}>
            <Loader />
          </div>
        ) : (
          <>
            <Select
              label="План абонемента"
              placeholder="Выберите план..."
              options={planOptions}
              value={selectedPlanId}
              onChange={setSelectedPlanId}
            />

            {selectedPlan && (
              <div className={styles.planDetails}>
                <div>Проходов: {selectedPlan.passes}</div>
                <div>Действует: {selectedPlan.expiresIn} дней</div>
                {selectedPlan.description && <div>Описание: {selectedPlan.description}</div>}
              </div>
            )}

            {error && (
              <div className={styles.error}>
                Не удалось выдать абонемент. Попробуйте снова.
              </div>
            )}

            <div className={styles.actions}>
              <TextButton type="secondary" size="m" onClick={onClose}>
                Отмена
              </TextButton>
              <TextButton
                type="primary"
                size="m"
                onClick={handleGrant}
                disabled={!selectedPlanId || isGranting}
              >
                {isGranting ? 'Выдаём...' : 'Выдать'}
              </TextButton>
            </div>
          </>
        )}
      </div>
    </SideModal>
  );
}
