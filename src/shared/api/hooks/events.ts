import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { eventsClient } from '../clients/events';
import type { Event, EventCreateDto, EventUpdateDto, EventFilters, PaginatedResponse } from '../types';

// Query key factory for events
export const eventsKeys = {
  all: ['events'] as const,
  lists: () => [...eventsKeys.all, 'list'] as const,
  list: (filters?: EventFilters) => [...eventsKeys.lists(), filters] as const,
  details: () => [...eventsKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventsKeys.details(), id] as const,
} as const;

/**
 * Events hooks
 */

// Get events catalog
export const useEvents = (filters?: EventFilters) => {
  return useQuery({
    queryKey: eventsKeys.list(filters),
    queryFn: () => eventsClient.getEvents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Infinite query for events catalog
export const useEventsInfinite = (filters?: Omit<EventFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: eventsKeys.list(filters),
    queryFn: ({ pageParam }) => eventsClient.getEvents({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Event>) => lastPage.next,
    staleTime: 5 * 60 * 1000,
  });
};

// Get event by ID
export function useEvent(id?: string, enabled?: boolean) {
  return useQuery({
    queryKey: eventsKeys.detail(id ?? ''),
    queryFn: () => eventsClient.getEventById(id ?? ''),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled
  });
};

// Create event mutation (ADMIN only)
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventCreateDto) => eventsClient.createEvent(data),
    onSuccess: (newEvent) => {
      // Invalidate events lists to show the new event
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });

      // Optionally add to cache
      queryClient.setQueryData(eventsKeys.detail(newEvent.id), newEvent);
    },
    onError: (error) => {
      console.error('Failed to create event:', error);
    },
  });
};

// Update event mutation (ADMIN only)
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventUpdateDto }) =>
      eventsClient.updateEvent(id, data),
    onSuccess: (updatedEvent, variables) => {
      // Update the specific event in cache
      queryClient.setQueryData(eventsKeys.detail(variables.id), updatedEvent);

      // Invalidate events lists to show updated event
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update event:', error);
    },
  });
};

// Hook for searching events
export const useEventSearch = (searchQuery: string, additionalFilters?: Omit<EventFilters, 'q'>) => {
  const filters: EventFilters = {
    q: searchQuery,
    ...additionalFilters,
  };

  return useQuery({
    queryKey: eventsKeys.list(filters),
    queryFn: () => eventsClient.getEvents(filters),
    enabled: searchQuery.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Hook for upcoming events
export const useUpcomingEvents = (limit: number = 20) => {
  const filters: EventFilters = {
    startsAfter: new Date().toISOString(),
    limit,
  };

  return useQuery({
    queryKey: eventsKeys.list(filters),
    queryFn: () => eventsClient.getEvents(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};