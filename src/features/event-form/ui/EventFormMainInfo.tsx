import { TextInput, Select } from '@/shared/ui';
import type { FormData } from '../lib/types';
import { useEventFormContext } from '../lib/context';
import styles from './EventForm.module.scss';

export function EventFormMainInfo() {
  const { formData, errors, handleInputChange, categories } = useEventFormContext();

  const handleInputChangeWithClearError = (field: keyof FormData, value: string) => {
    handleInputChange(field, value);
  };

  return (
    <div className={styles.mainInfo}>
      {categories && categories.length > 0 && <Select
        label="Категория"
        name="categories"
        options={categories}
        value={formData.category ?? categories.find(c => c.selected)?.value ?? categories[0].value}
        onChange={(value) => handleInputChangeWithClearError('category', value)}
      />}

      <TextInput
        label="Название"
        name="title"
        placeholder="Тренировка на волне"
        value={formData.title}
        onChange={(e) => handleInputChangeWithClearError('title', e.target.value)}
        error={!!errors.title}
        hint={errors.title}
      />

      <TextInput
        label="Место"
        name="location"
        placeholder="Ставропольская ул., 43, Москва"
        value={formData.location}
        onChange={(e) => handleInputChangeWithClearError('location', e.target.value)}
        error={!!errors.location}
        hint={errors.location}
      />

      <TextInput
        label="Ссылка на Yandex Maps"
        name="mapUrl"
        type="text"
        placeholder="https://yandex.ru/maps/..."
        value={formData.mapUrl}
        onChange={(e) => handleInputChangeWithClearError('mapUrl', e.target.value)}
      />

      <TextInput
        label="Бронь"
        name="prepayment"
        placeholder="7900"
        type="number"
        step="1"
        min="0"
        value={formData.prepayment}
        onChange={(e) => handleInputChangeWithClearError('prepayment', e.target.value)}
        error={!!errors.prepayment}
        hint={errors.prepayment}
      />

      <div className={styles.priceRow}>
        <TextInput
          label="Цена"
          name="price"
          placeholder="7900"
          type="number"
          step="1"
          min="0"
          value={formData.price}
          onChange={(e) => handleInputChangeWithClearError('price', e.target.value)}
          error={!!errors.price}
          hint={errors.price}
        />
        <Select
          label="Валюта"
          name="currency"
          options={[
            { label: '₽ RUB', value: 'RUB' },
            { label: '$ USD', value: 'USD' },
          ]}
          value={formData.currency}
          onChange={(value) => handleInputChangeWithClearError('currency', value)}
        />
      </div>

      <TextInput
        label="Кол-во мест"
        name="capacity"
        type="number"
        placeholder="10"
        value={formData.capacity}
        onChange={(e) => handleInputChangeWithClearError('capacity', e.target.value)}
        error={!!errors.capacity}
        hint={errors.capacity}
      />
    </div>
  );
}