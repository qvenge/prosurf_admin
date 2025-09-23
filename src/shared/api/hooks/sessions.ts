import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { sessionsClient } from '../clients/sessions';
import { eventsKeys } from './events';
import type {
  Session,
  SessionCompact,
  SessionCreateDto,
  SessionUpdateDto,
  SessionFilters,
  PaginatedResponse,
  IdempotencyKey
} from '../types';

// Query key factory for sessions
export const sessionsKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionsKeys.all, 'list'] as const,
  list: (filters?: SessionFilters) => [...sessionsKeys.lists(), filters] as const,
  details: () => [...sessionsKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionsKeys.details(), id] as const,
  eventSessions: (eventId: string, filters?: SessionFilters) => 
    [...eventsKeys.detail(eventId), 'sessions', filters] as const,
} as const;

/**
 * Sessions hooks
 */

// Get sessions for an event
export const useEventSessions = (eventId: string, filters?: SessionFilters) => {
  return useQuery({
    queryKey: sessionsKeys.eventSessions(eventId, filters),
    queryFn: () => sessionsClient.getEventSessions(eventId, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Infinite query for event sessions
export const useEventSessionsInfinite = (
  eventId: string,
  filters?: Omit<SessionFilters, 'cursor'>
) => {
  return useInfiniteQuery({
    queryKey: sessionsKeys.eventSessions(eventId, filters),
    queryFn: ({ pageParam }) =>
      sessionsClient.getEventSessions(eventId, { ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<SessionCompact>) => lastPage.next,
    staleTime: 2 * 60 * 1000,
  });
};

// Create sessions for an event (ADMIN only)
export const useCreateEventSessions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      eventId, 
      data, 
      idempotencyKey 
    }: { 
      eventId: string; 
      data: SessionCreateDto | SessionCreateDto[];
      idempotencyKey: IdempotencyKey;
    }) => sessionsClient.createEventSessions(eventId, data, idempotencyKey),
    onSuccess: (_, variables) => {
      // Invalidate event sessions queries
      queryClient.invalidateQueries({ 
        queryKey: [eventsKeys.detail(variables.eventId)[0], eventsKeys.detail(variables.eventId)[1], eventsKeys.detail(variables.eventId)[2], 'sessions'] 
      });
      
      // Invalidate general sessions lists
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to create sessions:', error);
    },
  });
};

// Search sessions across all events
export const useSessions = (filters?: SessionFilters) => {
  return useQuery({
    queryKey: sessionsKeys.list(filters),
    queryFn: () => sessionsClient.getSessions(filters),
    staleTime: 2 * 60 * 1000,
  });
};

// Infinite query for sessions search
export const useSessionsInfinite = (filters?: Omit<SessionFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: sessionsKeys.list(filters),
    queryFn: ({ pageParam }) => sessionsClient.getSessions({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Session>) => lastPage.next,
    staleTime: 2 * 60 * 1000,
  });
};

// Get session by ID
export const useSession = (id: string) => {
  return useQuery({
    queryKey: sessionsKeys.detail(id),
    queryFn: () => sessionsClient.getSessionById(id),
    staleTime: 1 * 60 * 1000, // 1 minute (session data changes frequently)
  });
};

// Update session mutation (ADMIN only)
export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SessionUpdateDto }) => 
      sessionsClient.updateSession(id, data),
    onSuccess: (updatedSession, variables) => {
      // Update the specific session in cache
      queryClient.setQueryData(sessionsKeys.detail(variables.id), updatedSession);
      
      // Invalidate sessions lists and event sessions
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey.includes('sessions') && query.queryKey.includes(updatedSession.event.id)
      });
    },
    onError: (error) => {
      console.error('Failed to update session:', error);
    },
  });
};

// Cancel session mutation (ADMIN only)
export const useCancelSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => sessionsClient.cancelSession(id),
    onSuccess: (cancelledSession, sessionId) => {
      // Update the specific session in cache
      queryClient.setQueryData(sessionsKeys.detail(sessionId), cancelledSession);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey.includes('sessions') && query.queryKey.includes(cancelledSession.event.id)
      });
    },
    onError: (error) => {
      console.error('Failed to cancel session:', error);
    },
  });
};

// Hook for upcoming sessions
export const useUpcomingSessions = (limit: number = 20) => {
  const filters: SessionFilters = {
    startsAfter: new Date().toISOString(),
    limit,
  };

  return useQuery({
    queryKey: sessionsKeys.list(filters),
    queryFn: () => sessionsClient.getSessions(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Hook for available sessions (with seats)
export const useAvailableSessions = (filters?: Omit<SessionFilters, 'cursor'>) => {
  return useQuery({
    queryKey: sessionsKeys.list({ ...filters, startsAfter: new Date().toISOString() }),
    queryFn: () => sessionsClient.getSessions({ ...filters, startsAfter: new Date().toISOString() }),
    select: (data) => ({
      ...data,
      items: data.items.filter(session => session.remainingSeats > 0),
    }),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};