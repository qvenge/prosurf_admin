import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { sessionsClient } from '../clients/sessions';
import { eventsKeys } from './events';
import { adminKeys } from './admin';
import { REFRESH_INTERVALS } from '../config/refresh-intervals';
import type {
  Session,
  SessionCompact,
  SessionCreateDto,
  SessionUpdateDto,
  SessionFilters,
  PaginatedResponse,
  IdempotencyKey,
  SessionBulkDeleteDto
} from '../types';

export const sessionsKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionsKeys.all, 'list'] as const,
  list: (filters?: SessionFilters) => [...sessionsKeys.lists(), filters] as const,
  details: () => [...sessionsKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionsKeys.details(), id] as const,
  eventSessions: (eventId: string, filters?: SessionFilters) =>
    [...eventsKeys.detail(eventId), 'sessions', filters] as const,
} as const;

export const useEventSessions = (eventId?: string, filters?: SessionFilters, enabled?: boolean) => {
  return useQuery({
    queryKey: sessionsKeys.eventSessions(eventId ?? '', filters),
    queryFn: () => sessionsClient.getEventSessions(eventId ?? '', filters),
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.SESSIONS,
    refetchIntervalInBackground: false,
    enabled
  });
};

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
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.SESSIONS,
    refetchIntervalInBackground: false,
  });
};

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
      queryClient.invalidateQueries({
        queryKey: [eventsKeys.detail(variables.eventId)[0], eventsKeys.detail(variables.eventId)[1], eventsKeys.detail(variables.eventId)[2], 'sessions']
      });
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.sessionsAdminBase() });
    },
    onError: (error) => {
      console.error('Failed to create sessions:', error);
    },
  });
};

export const useSessions = (filters?: SessionFilters) => {
  return useQuery({
    queryKey: sessionsKeys.list(filters),
    queryFn: () => sessionsClient.getSessions(filters),
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.SESSIONS,
    refetchIntervalInBackground: false,
  });
};

export const useSessionsInfinite = (filters?: Omit<SessionFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: sessionsKeys.list(filters),
    queryFn: ({ pageParam }) => sessionsClient.getSessions({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Session>) => lastPage.next,
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.SESSIONS,
    refetchIntervalInBackground: false,
  });
};

export const useSession = (id: string) => {
  return useQuery({
    queryKey: sessionsKeys.detail(id),
    queryFn: () => sessionsClient.getSessionById(id),
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.SESSIONS,
    refetchIntervalInBackground: false,
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, force }: { id: string; data: SessionUpdateDto; force?: boolean }) =>
      sessionsClient.updateSession(id, data, force),
    onSuccess: (updatedSession, variables) => {
      queryClient.setQueryData(sessionsKeys.detail(variables.id), updatedSession);
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.sessionsAdminBase() });
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

/**
 * Поведение зависит от наличия бронирований:
 * - Нет бронирований: полное удаление (возвращает null)
 * - Есть бронирования + force: мягкая отмена (возвращает Session со статусом CANCELLED)
 * - Есть бронирования без force: ошибка 409 Conflict
 */
export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      sessionsClient.deleteSession(id, force),
    onSuccess: (result, variables) => {
      if (result) {
        queryClient.setQueryData(sessionsKeys.detail(variables.id), result);
      } else {
        queryClient.removeQueries({ queryKey: sessionsKeys.detail(variables.id) });
      }
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.sessionsAdminBase() });
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes('sessions')
      });
    },
    onError: (error) => {
      console.error('Failed to delete session:', error);
    },
  });
};

/** @deprecated Используйте useDeleteSession */
export const useCancelSession = useDeleteSession;

export const useBulkDeleteSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      idempotencyKey
    }: {
      data: SessionBulkDeleteDto;
      idempotencyKey: IdempotencyKey;
    }) => sessionsClient.bulkDeleteSessions(data, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.sessionsAdminBase() });
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes('sessions')
      });
    },
    onError: (error) => {
      console.error('Failed to bulk delete sessions:', error);
    },
  });
};

export const useUpcomingSessions = (limit: number = 20) => {
  const filters: SessionFilters = {
    startsAfter: new Date().toISOString(),
    limit,
  };

  return useQuery({
    queryKey: sessionsKeys.list(filters),
    queryFn: () => sessionsClient.getSessions(filters),
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.SESSIONS,
    refetchIntervalInBackground: false,
  });
};

export const useAvailableSessions = (filters?: Omit<SessionFilters, 'cursor'>) => {
  return useQuery({
    queryKey: sessionsKeys.list({ ...filters, startsAfter: new Date().toISOString() }),
    queryFn: () => sessionsClient.getSessions({ ...filters, startsAfter: new Date().toISOString() }),
    select: (data) => ({
      ...data,
      items: data.items.filter(session => session.remainingSeats > 0),
    }),
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.SESSIONS,
    refetchIntervalInBackground: false,
  });
};