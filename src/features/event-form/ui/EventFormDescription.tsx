import { Textarea } from '@/shared/ui';
import type { FormData } from '../lib/types';
import { maxDescriptionLength } from '../lib/constants';
import styles from './EventForm.module.scss';

interface EventFormDescriptionProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

export function EventFormDescription({ formData, onInputChange }: EventFormDescriptionProps) {
  return (
    <div className={styles.description}>
      <Textarea
        label="Описание тренировки"
        placeholder="Введите текст"
        value={formData.description}
        onChange={(e) => onInputChange('description', e.target.value)}
        maxLength={maxDescriptionLength}
        showCounter
        autoResize
      />

      <Textarea
        label="Что с собой?"
        placeholder="Введите текст"
        value={formData.whatToBring}
        onChange={(e) => onInputChange('whatToBring', e.target.value)}
        maxLength={maxDescriptionLength}
        showCounter
        autoResize
      />
    </div>
  );
}