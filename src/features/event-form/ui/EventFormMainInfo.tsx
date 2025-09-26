import { TextInput, Select } from '@/shared/ui';
import type { FormData, ValidationErrors, Category } from '../lib/types';
import styles from './EventForm.module.scss';

interface EventFormMainInfoProps {
  formData: FormData;
  errors: ValidationErrors;
  categories?: Category[];
  onInputChange: (field: keyof FormData, value: string) => void;
  onClearError: (field: string) => void;
}

export function EventFormMainInfo({
  formData,
  errors,
  onInputChange,
  onClearError,
  categories
}: EventFormMainInfoProps) {
  const handleInputChange = (field: keyof FormData, value: string) => {
    onInputChange(field, value);
    if (errors[field]) {
      onClearError(field);
    }
  };

  return (
    <div className={styles.mainInfo}>
      {categories && categories.length > 0 && <Select
        label="Категория"
        name="categories"
        options={categories}
        value={formData.category ?? categories.find(c => c.selected)?.value ?? categories[0].value}
        onChange={(value) => handleInputChange('category', value)}
      />}

      <TextInput
        label="Название"
        name="title"
        placeholder="Тренировка на волне"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        error={!!errors.title}
        hint={errors.title}
      />

      <TextInput
        label="Место"
        name="location"
        placeholder="Ставропольская ул., 43, Москва"
        value={formData.location}
        onChange={(e) => handleInputChange('location', e.target.value)}
        error={!!errors.location}
        hint={errors.location}
      />

      <TextInput
        label="Бронь"
        name="prepayment"
        placeholder="7900"
        type="number"
        step="1"
        min="0"
        value={formData.prepayment}
        onChange={(e) => handleInputChange('prepayment', e.target.value)}
        error={!!errors.prepayment}
        hint={errors.prepayment}
      />

      <TextInput
        label="Цена"
        name="price"
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
        name="capacity"
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