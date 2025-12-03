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
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
        maxLength={maxDescriptionLength}
        showCounter
        autoResize
      />

      <Textarea
        label="FAQ"
        placeholder="Введите текст"
        value={formData.whatToBring}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('whatToBring', e.target.value)}
        maxLength={maxDescriptionLength}
        showCounter
        autoResize
      />
    </div>
  );
}