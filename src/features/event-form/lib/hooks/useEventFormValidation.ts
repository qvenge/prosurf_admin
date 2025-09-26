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

    if (!formData.capacity.trim()) {
      newErrors.capacity = 'Количество мест обязательно';
    } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      newErrors.capacity = 'Количество мест должно быть положительным числом';
    }

    formData.sessions.forEach((session) => {
      if (!session.date) {
        newErrors[`session_${session.id}_date`] = 'Дата обязательна';
      }
      session.timeSlots.forEach((timeSlot) => {
        if (!timeSlot.startTime) {
          newErrors[`session_${session.id}_timeSlot_${timeSlot.id}_time`] = 'Время обязательно';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    errors,
    clearError,
    validateForm,
  };
}