import { Button } from '@/shared/ui';
import styles from './EventForm.module.scss';

interface EventFormActionsProps {
  isEditMode: boolean;
  isLoading: boolean;
  onSubmit: () => void;
}

export function EventFormActions({ isEditMode, isLoading, onSubmit }: EventFormActionsProps) {
  return (
    <div className={styles.actions}>
      <Button
        type="primary"
        size="l"
        onClick={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? 'Сохранение...' : (isEditMode ? 'Сохранить' : 'Добавить')}
      </Button>
    </div>
  );
}