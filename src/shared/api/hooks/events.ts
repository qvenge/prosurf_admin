import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { eventsClient } from '../clients/events';
import { adminKeys } from './admin';
import type { Event, EventCreateDto, EventUpdateDto, EventFilters, PaginatedResponse } from '../types';

export const eventsKeys = {
  all: ['events'] as const,
  lists: () => [...eventsKeys.all, 'list'] as const,
  list: (filters?: EventFilters) => [...eventsKeys.lists(), filters] as const,
  details: () => [...eventsKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventsKeys.details(), id] as const,
} as const;

export const useEvents = (filters?: EventFilters) => {
  return useQuery({
    queryKey: eventsKeys.list(filters),
    queryFn: () => eventsClient.getEvents(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useEventsInfinite = (filters?: Omit<EventFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: eventsKeys.list(filters),
    queryFn: ({ pageParam }) => eventsClient.getEvents({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Event>) => lastPage.next,
    staleTime: 5 * 60 * 1000,
  });
};

export function useEvent(id?: string, enabled?: boolean) {
  return useQuery({
    queryKey: eventsKeys.detail(id ?? ''),
    queryFn: () => eventsClient.getEventById(id ?? ''),
    staleTime: 10 * 60 * 1000,
    enabled
  });
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventCreateDto) => eventsClient.createEvent(data),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.eventsAdminBase() });
      queryClient.setQueryData(eventsKeys.detail(newEvent.id), newEvent);
    },
    onError: (error) => {
      console.error('Failed to create event:', error);
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, force }: { id: string; data: EventUpdateDto; force?: boolean }) =>
      eventsClient.updateEvent(id, data, force),
    onSuccess: (updatedEvent, variables) => {
      queryClient.setQueryData(eventsKeys.detail(variables.id), updatedEvent);
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.eventsAdminBase() });
    },
    onError: (error) => {
      console.error('Failed to update event:', error);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      eventsClient.deleteEvent(id, force),
    onSuccess: (_, variables) => {
      queryClient.removeQueries({ queryKey: eventsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.eventsAdminBase() });
    },
    onError: (error) => {
      console.error('Failed to delete event:', error);
    },
  });
};

export const useEventSearch = (searchQuery: string, additionalFilters?: Omit<EventFilters, 'q'>) => {
  const filters: EventFilters = {
    q: searchQuery,
    ...additionalFilters,
  };

  return useQuery({
    queryKey: eventsKeys.list(filters),
    queryFn: () => eventsClient.getEvents(filters),
    enabled: searchQuery.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUpcomingEvents = (limit: number = 20) => {
  const filters: EventFilters = {
    startsAfter: new Date().toISOString(),
    limit,
  };

  return useQuery({
    queryKey: eventsKeys.list(filters),
    queryFn: () => eventsClient.getEvents(filters),
    staleTime: 3 * 60 * 1000,
  });
};