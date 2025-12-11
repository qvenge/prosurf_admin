import { useState } from 'react';
import { TextInput, Select, Button, Checkbox } from '@/shared/ui';
import { useCreateSeasonTicketPlan, useUpdateSeasonTicketPlan } from '@/shared/api';
import type { SeasonTicketPlan, SeasonTicketPlanUpdateDto, SeasonTicketPlanCreateDto } from '@/shared/api';
import styles from './PlanForm.module.scss';

interface PlanFormProps {
  onClose: () => void;
  planData?: SeasonTicketPlan;
}

type DesciplineValue = 'training:surfing' | 'training:surfskate';

interface FormData {
  discipline: { value: DesciplineValue; label: string };
  name: string;
  passes: string;
  price: string;
  expiresIn: string;
  isSystemPlan: boolean;
}

const disciplineOptions: Record<DesciplineValue, string> = {
  'training:surfing': 'Серфинг',
  'training:surfskate': 'Серфскейт'
};

const monthsToDays = (expiresIn: string): number => {
  const months = parseInt(expiresIn);
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return Math.round(Math.abs((date.getTime() - (new Date()).getTime()) / (24 * 60 * 60 * 1000)));
}

export function PlanForm({ onClose, planData }: PlanFormProps) {
  const [formData, setFormData] = useState<FormData>({
    discipline: { value: 'training:surfing', label: 'Серфинг' },
    name: planData?.name ?? '',
    passes: String(planData?.passes ?? ''),
    price: String(planData?.price.amountMinor ?? ''),
    expiresIn: planData ? '12' : '',
    isSystemPlan: planData?.isSystemPlan ?? false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = !!planData;

  const createPlanMutation = useCreateSeasonTicketPlan();
  const updatePlantMutation = useUpdateSeasonTicketPlan();

  const handleInputChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }

    if (!formData.passes.trim()) {
      newErrors.passes = 'Кол-во занятий обязательно';
    } else if (isNaN(Number(formData.passes)) || Number(formData.passes) <= 0) {
      newErrors.passes = 'Количество занятий должно быть положительным числом';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Цена обязательна';
    }

    if (!formData.expiresIn.trim()) {
      newErrors.expiresIn = 'Срок действия обязателен';
    } else if (isNaN(Number(formData.expiresIn)) || Number(formData.expiresIn) <= 0) {
      newErrors.expiresIn = 'Срок действия должен быть положительным числом';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Convert price to minor units (kopecks)
      const priceInKopecks = Math.round(parseFloat(formData.price) * 100);

      if (isEditMode) {
        // Update mode
        const planUpdateData: SeasonTicketPlanUpdateDto = {
          name: formData.name,
          description: formData.discipline.label,
          price: {
            ...planData.price,
            amountMinor: priceInKopecks,
          },
          eventFilter: {
            labels: {
              any: [formData.discipline.value],
            },
          },
          passes: parseInt(formData.passes),
          expiresIn: monthsToDays(formData.expiresIn),
        };

        await updatePlantMutation.mutateAsync({ id: planData.id!, data: planUpdateData });

      } else {
        // Create mode
        const planCreateData: SeasonTicketPlanCreateDto = {
          name: formData.name,
          description: formData.discipline.label,
          price: {
            currency: 'RUB',
            amountMinor: priceInKopecks,
          },
          passes: parseInt(formData.passes),
          eventFilter: {
            labels: {
              any: [formData.discipline.value],
            },
          },
          expiresIn: monthsToDays(formData.expiresIn),
          isSystemPlan: formData.isSystemPlan,
        };

        await createPlanMutation.mutateAsync(planCreateData);
      }

      onClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} plan:`, error);
    }
  };

  const isLoading = createPlanMutation.isPending || updatePlantMutation.isPending;

  return (
    <div className={styles.root}>
      <div className={styles.form}>
        <Select
          label="Дисциплина"
          options={Object.entries(disciplineOptions).map(([value, label]) => ({ value, label }))}
          value={formData.discipline.value}
          onChange={(value) => handleInputChange('discipline', { value: value as DesciplineValue, label: disciplineOptions[value as DesciplineValue] })}
        />

        <TextInput
          label="Название"
          placeholder="Абонемент 2 занятия"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={!!errors.name}
          hint={errors.name}
        />

        <TextInput
          label="Кол-во занятий"
          type="number"
          placeholder="10"
          value={formData.passes}
          onChange={(e) => handleInputChange('passes', e.target.value)}
          error={!!errors.passes}
          hint={errors.passes}
        />

        <TextInput
          label="Цена"
          placeholder="10000"
          type="number"
          step="1"
          min="0"
          value={formData.price}
          onChange={(e) => handleInputChange('price', e.target.value)}
          error={!!errors.price}
          hint={errors.price}
        />

        <TextInput
          label="Срок действия, месяцев"
          type="number"
          placeholder="10"
          value={formData.expiresIn}
          onChange={(e) => handleInputChange('expiresIn', e.target.value)}
          error={!!errors.expiresIn}
          hint={errors.expiresIn}
        />

        <Checkbox
          label="Системный план"
          checked={formData.isSystemPlan}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('isSystemPlan', e.target.checked)}
        />
      </div>

      <div className={styles.actions}>
        <Button
          type="primary"
          size="l"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : (isEditMode ? 'Изменить' : 'Добавить')}
        </Button>
      </div>
    </div>
  );
}
