import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessionsClient, sessionsKeys, eventsClient, eventsKeys } from '@/shared/api';
import type { FormData } from '../types';
import { convertEventDataToFormData } from '../utils';
import { defaultFormData } from '../constants';

export function useEventFormInitialization(eventId?: string) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [existingSessions, setExistingSessions] = useState<string[]>([]);

  const isEditMode = !!eventId;

  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: eventsKeys.detail(eventId || ''),
    queryFn: () => eventsClient.getEventById(eventId || ''),
    enabled: isEditMode,
    staleTime: 10 * 60 * 1000,
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: sessionsKeys.eventSessions(eventId || ''),
    queryFn: () => sessionsClient.getEventSessions(eventId || ''),
    enabled: isEditMode,
    staleTime: 2 * 60 * 1000,
  });

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