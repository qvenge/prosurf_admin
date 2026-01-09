import clsx from 'clsx';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import styles from './confirm-modal.module.scss';

export interface ConfirmModalProps {
  /** Modal visibility state */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when primary action is confirmed */
  onConfirm: () => void;
  /** Modal title text */
  title: string;
  /** Main description/question text */
  description?: React.ReactNode;
  /** Additional info text (smaller, tertiary color) */
  info?: React.ReactNode;
  /** Visual variant affecting the confirm button styling */
  variant?: 'default' | 'danger';
  /** Text for the cancel button - defaults to "Отмена" */
  cancelText?: string;
  /** Text for the confirm button - defaults to "Подтвердить" */
  confirmText?: string;
  /** Loading text for the confirm button when action is pending */
  confirmLoadingText?: string;
  /** Whether the confirm action is currently in progress */
  isLoading?: boolean;
  /** Disable confirm button (e.g., for validation) */
  confirmDisabled?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  info,
  variant = 'default',
  cancelText = 'Отмена',
  confirmText = 'Подтвердить',
  confirmLoadingText,
  isLoading = false,
  confirmDisabled = false,
}: ConfirmModalProps) {
  if (!open) return null;

  const handleConfirm = () => {
    if (!isLoading && !confirmDisabled) {
      onConfirm();
    }
  };

  return (
    <Modal onClose={onClose} size="md" showCloseButton={false}>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
        {info && <p className={styles.info}>{info}</p>}
      </div>
      <div className={styles.actions}>
        <Button type="secondary" size="l" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          type="primary"
          size="l"
          onClick={handleConfirm}
          disabled={isLoading || confirmDisabled}
          className={clsx(variant === 'danger' && styles.dangerButton)}
        >
          {isLoading ? (confirmLoadingText || confirmText) : confirmText}
        </Button>
      </div>
    </Modal>
  );
}
