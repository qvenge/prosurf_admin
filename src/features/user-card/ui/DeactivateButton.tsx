import { useState } from 'react';
import type { Client } from '@/shared/api';
import { useToggleClientStatus } from '@/shared/api/hooks/clients';
import { TextButton, ConfirmModal } from '@/shared/ui';
import styles from './DeactivateButton.module.scss';

export interface DeactivateButtonProps {
  client: Client;
}

export function DeactivateButton({ client }: DeactivateButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const toggleStatus = useToggleClientStatus();

  const isActive = client.isActive !== false;

  const handleToggleStatus = () => {
    toggleStatus.mutate(
      { id: client.id, isActive: !isActive },
      {
        onSuccess: () => {
          setShowConfirm(false);
        },
      }
    );
  };

  return (
    <div className={styles.root}>
      <TextButton
        type={isActive ? 'negative' : 'secondary'}
        size="m"
        onClick={() => setShowConfirm(true)}
      >
        {isActive ? 'Удалить пользователя' : 'Восстановить пользователя'}
      </TextButton>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleToggleStatus}
        title={isActive ? 'Удалить пользователя?' : 'Восстановить пользователя?'}
        variant={isActive ? 'danger' : 'default'}
        confirmText={isActive ? 'Удалить' : 'Восстановить'}
        confirmLoadingText={isActive ? 'Удаление...' : 'Восстановление...'}
        isLoading={toggleStatus.isPending}
      />
    </div>
  );
}
