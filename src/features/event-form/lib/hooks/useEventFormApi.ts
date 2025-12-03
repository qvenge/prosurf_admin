import { useCreateEvent, useUpdateEvent } from '@/shared/api';
import type { FormData } from '../types';
import { convertFormDataToEventCreateDto, convertFormDataToEventUpdateDto } from '../utils';

export function useEventFormApi(labels?: string[]) {
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();

  const createEvent = async (formData: FormData) => {
    const eventCreateData = convertFormDataToEventCreateDto(formData, labels);
    await createEventMutation.mutateAsync(eventCreateData);
  };

  const updateEvent = async (eventId: string, formData: FormData) => {
    const eventUpdateData = convertFormDataToEventUpdateDto(formData, labels);
    await updateEventMutation.mutateAsync({ id: eventId, data: eventUpdateData, force: true });
  };

  const isLoading = createEventMutation.isPending || updateEventMutation.isPending;

  return {
    createEvent,
    updateEvent,
    isLoading,
  };
}
