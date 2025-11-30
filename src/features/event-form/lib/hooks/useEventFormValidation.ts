import { useState } from 'react';
import type { FormData, ValidationErrors } from '../types';

export function useEventFormValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (formData: FormData): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Место обязательно';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Цена обязательна';
    } else if (isNaN(Number(formData.price))) {
      newErrors.price = 'Цена должна быть числом';
    }

    if (
      !isNaN(Number(formData.price.trim())) &&
      !isNaN(Number(formData.prepayment.trim())) &&
      Number(formData.price.trim()) < Number(formData.prepayment.trim())
    ) {
      newErrors.prepayment = 'Предоплата не может быть больше цены';
    }

    if (!formData.capacity.trim()) {
      newErrors.capacity = 'Количество мест обязательно';
    } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      newErrors.capacity = 'Количество мест должно быть положительным числом';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    errors,
    clearError,
    validateForm,
  };
}
