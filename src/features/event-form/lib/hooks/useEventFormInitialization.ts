import { useState } from 'react';
import { useEvent, useEventSessions } from '@/shared/api';
import type { FormData } from '../types';
import { convertEventDataToFormData } from '../utils';
import { defaultFormData } from '../constants';

export function useEventFormInitialization(eventId?: string) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [existingSessions, setExistingSessions] = useState<string[]>([]);

  const isEditMode = !!eventId;

  const { data: eventData, isLoading: eventLoading } = useEvent(eventId, isEditMode);
  const { data: sessionsData, isLoading: sessionsLoading } = useEventSessions(eventId, undefined, isEditMode);

  const initializeFormData = (): FormData | null => {
    if (!isEditMode || !eventData || !sessionsData || isInitialized) {
      return null;
    }

    const convertedData = convertEventDataToFormData(eventData, sessionsData);
    const newFormData: FormData = {
      ...defaultFormData,
      ...convertedData,
    };

    setExistingSessions(sessionsData.items.map((s: { id: string }) => s.id));
    setIsInitialized(true);

    return newFormData;
  };

  const isInitialLoading = isEditMode && (eventLoading || sessionsLoading);

  return {
    isEditMode,
    isInitialized,
    existingSessions,
    isInitialLoading,
    initializeFormData,
  };
}