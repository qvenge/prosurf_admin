import { TextInput, Select } from '@/shared/ui';
import type { FormData, ValidationErrors } from '../lib/types';
import { disciplineOptions } from '../lib/constants';
import styles from './EventForm.module.scss';

interface EventFormMainInfoProps {
  formData: FormData;
  errors: ValidationErrors;
  onInputChange: (field: keyof FormData, value: string) => void;
  onClearError: (field: string) => void;
}

export function EventFormMainInfo({ formData, errors, onInputChange, onClearError }: EventFormMainInfoProps) {
  const handleInputChange = (field: keyof FormData, value: string) => {
    onInputChange(field, value);
    if (errors[field]) {
      onClearError(field);
    }
  };

  return (
    <div className={styles.mainInfo}>
      <Select
        label="Дисциплина"
        options={disciplineOptions}
        value={formData.discipline}
        onChange={(value) => handleInputChange('discipline', value)}
      />

      <TextInput
        label="Название"
        placeholder="Тренировка на волне"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        error={!!errors.title}
        hint={errors.title}
      />

      <TextInput
        label="Место"
        placeholder="Ставропольская ул., 43, Москва"
        value={formData.location}
        onChange={(e) => handleInputChange('location', e.target.value)}
        error={!!errors.location}
        hint={errors.location}
      />

      <TextInput
        label="Цена разовой тренировки"
        placeholder="7900"
        type="number"
        step="1"
        min="0"
        value={formData.price}
        onChange={(e) => handleInputChange('price', e.target.value)}
        error={!!errors.price}
        hint={errors.price}
      />

      <TextInput
        label="Кол-во мест"
        type="number"
        placeholder="10"
        value={formData.capacity}
        onChange={(e) => handleInputChange('capacity', e.target.value)}
        error={!!errors.capacity}
        hint={errors.capacity}
      />
    </div>
  );
}