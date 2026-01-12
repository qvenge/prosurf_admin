import clsx from 'clsx';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import styles from './confirm-modal.module.scss';

export interface ConfirmModalProps {
  /** Состояние видимости модального окна */
  open: boolean;
  /** Колбэк при закрытии модального окна */
  onClose: () => void;
  /** Колбэк при подтверждении основного действия */
  onConfirm: () => void;
  /** Заголовок модального окна */
  title: string;
  /** Основной текст описания/вопроса */
  description?: React.ReactNode;
  /** Дополнительная информация (мелким шрифтом, третичный цвет) */
  info?: React.ReactNode;
  /** Визуальный вариант, влияющий на стилизацию кнопки подтверждения */
  variant?: 'default' | 'danger';
  /** Текст кнопки отмены (по умолчанию "Отмена") */
  cancelText?: string;
  /** Текст кнопки подтверждения (по умолчанию "Подтвердить") */
  confirmText?: string;
  /** Текст кнопки подтверждения во время загрузки */
  confirmLoadingText?: string;
  /** Выполняется ли сейчас действие подтверждения */
  isLoading?: boolean;
  /** Отключить кнопку подтверждения (например, для валидации) */
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
