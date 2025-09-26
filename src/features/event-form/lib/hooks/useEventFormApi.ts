import { useCreateEvent, useCreateEventSessions, useUpdateEvent, useBulkDeleteSessions } from '@/shared/api';
import type { FormData } from '../types';
import { convertFormDataToEventCreateDto, convertFormDataToEventUpdateDto, convertSessionsToSessionCreateDtos } from '../utils';

export function useEventFormApi() {
  const createEventMutation = useCreateEvent();
  const createSessionsMutation = useCreateEventSessions();
  const updateEventMutation = useUpdateEvent();
  const bulkDeleteSessionsMutation = useBulkDeleteSessions();

  const createEvent = async (formData: FormData) => {
    const eventCreateData = convertFormDataToEventCreateDto(formData);
    const createdEvent = await createEventMutation.mutateAsync(eventCreateData);

    const sessionsData = convertSessionsToSessionCreateDtos(formData.sessions);
    await createSessionsMutation.mutateAsync({
      eventId: createdEvent.id,
      data: sessionsData,
      idempotencyKey: `event-${createdEvent.id}-${Date.now()}`,
    });
  };

  const updateEvent = async (eventId: string, formData: FormData, existingSessionIds: string[]) => {
    const eventUpdateData = convertFormDataToEventUpdateDto(formData);
    await updateEventMutation.mutateAsync({ id: eventId, data: eventUpdateData });

    if (existingSessionIds.length > 0) {
      await bulkDeleteSessionsMutation.mutateAsync({
        data: { ids: existingSessionIds },
        idempotencyKey: `delete-sessions-${eventId}-${Date.now()}`,
      });
    }

    const sessionsData = convertSessionsToSessionCreateDtos(formData.sessions);
    if (sessionsData.length > 0) {
      await createSessionsMutation.mutateAsync({
        eventId,
        data: sessionsData,
        idempotencyKey: `update-sessions-${eventId}-${Date.now()}`,
      });
    }
  };

  const isLoading = createEventMutation.isPending ||
                   createSessionsMutation.isPending ||
                   updateEventMutation.isPending ||
                   bulkDeleteSessionsMutation.isPending;

  return {
    createEvent,
    updateEvent,
    isLoading,
  };
}