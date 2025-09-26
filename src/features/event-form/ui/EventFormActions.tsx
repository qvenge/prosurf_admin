import { Button } from '@/shared/ui';
import { useEventFormContext } from '../lib/context';
import styles from './EventForm.module.scss';

export function EventFormActions() {
  const { isEditMode, isLoading, handleSubmit } = useEventFormContext();
  return (
    <div className={styles.actions}>
      <Button
        type="primary"
        size="l"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? 'Сохранение...' : (isEditMode ? 'Сохранить' : 'Добавить')}
      </Button>
    </div>
  );
}