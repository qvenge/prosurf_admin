import { Textarea } from '@/shared/ui';
import { maxDescriptionLength } from '../lib/constants';
import { useEventFormContext } from '../lib/context';
import styles from './EventForm.module.scss';

export function EventFormDescription() {
  const { formData, handleInputChange } = useEventFormContext();
  return (
    <div className={styles.description}>
      <Textarea
        label="Описание"
        placeholder="Введите текст"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        maxLength={maxDescriptionLength}
        showCounter
        autoResize
      />

      <Textarea
        label="FAQ"
        placeholder="Введите текст"
        value={formData.whatToBring}
        onChange={(e) => handleInputChange('whatToBring', e.target.value)}
        maxLength={maxDescriptionLength}
        showCounter
        autoResize
      />
    </div>
  );
}