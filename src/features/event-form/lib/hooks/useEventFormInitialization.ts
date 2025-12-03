import { useState } from 'react';
import { useEvent } from '@/shared/api';
import type { FormData, Category } from '../types';
import { convertEventDataToFormData } from '../utils';
import { defaultFormData } from '../constants';

export function useEventFormInitialization(eventId?: string, categories?: Category[]) {
  const [isInitialized, setIsInitialized] = useState(false);

  const isEditMode = !!eventId;

  const { data: eventData, isLoading: eventLoading } = useEvent(eventId, isEditMode);

  const initializeFormData = (): FormData | null => {
    if (!isEditMode || !eventData || isInitialized) {
      return null;
    }

    const convertedData = convertEventDataToFormData(eventData, categories);
    const newFormData: FormData = {
      ...defaultFormData,
      ...convertedData,
    };

    setIsInitialized(true);

    return newFormData;
  };

  const isInitialLoading = isEditMode && eventLoading;

  return {
    isEditMode,
    isInitialized,
    isInitialLoading,
    initializeFormData,
  };
}
