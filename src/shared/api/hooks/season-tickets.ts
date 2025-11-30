import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { seasonTicketsClient } from '../clients/season-tickets';
import type {
  SeasonTicketPlan,
  SeasonTicketPlanUpdateDto,
  SeasonTicketPlanCreateDto,
  PurchaseSeasonTicketDto,
  SeasonTicketPlanFilters,
  SeasonTicketFilters,
  SeasonTicket,
  PaginatedResponse,
  IdempotencyKey,
} from '../types';

export const seasonTicketsKeys = {
  all: ['season-tickets'] as const,
  plans: () => [...seasonTicketsKeys.all, 'plans'] as const,
  plansList: (filters?: SeasonTicketPlanFilters) => [...seasonTicketsKeys.plans(), filters] as const,
  plan: (id: string) => [...seasonTicketsKeys.plans(), id] as const,
  planApplicableEvents: (id: string, filters?: { cursor?: string; limit?: number }) =>
    [...seasonTicketsKeys.plan(id), 'applicable-events', filters] as const,
  tickets: () => [...seasonTicketsKeys.all, 'tickets'] as const,
  ticketsList: (filters?: SeasonTicketFilters) => [...seasonTicketsKeys.tickets(), filters] as const,
} as const;

export const useSeasonTicketPlans = (filters?: SeasonTicketPlanFilters) => {
  return useQuery({
    queryKey: seasonTicketsKeys.plansList(filters),
    queryFn: () => seasonTicketsClient.getSeasonTicketPlans(filters),
    staleTime: 10 * 60 * 1000,
  });
};

export const useSeasonTicketPlan = (id: string) => {
  return useQuery({
    queryKey: seasonTicketsKeys.plan(id),
    queryFn: () => seasonTicketsClient.getSeasonTicketPlan(id),
    staleTime: 10 * 60 * 1000,
  });
};

export const useSeasonTicketPlansInfinite = (filters?: Omit<SeasonTicketPlanFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: seasonTicketsKeys.plansList(filters),
    queryFn: ({ pageParam }) => seasonTicketsClient.getSeasonTicketPlans({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<SeasonTicketPlan>) => lastPage.next,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateSeasonTicketPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SeasonTicketPlanCreateDto) => seasonTicketsClient.createSeasonTicketPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonTicketsKeys.plans() });
    },
  });
};

export const useUpdateSeasonTicketPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SeasonTicketPlanUpdateDto }) =>
      seasonTicketsClient.updateSeasonTicketPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonTicketsKeys.plans() });
    },
  });
};

export const useDeleteSeasonTicketPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seasonTicketsClient.deleteSeasonTicketPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonTicketsKeys.plans() });
    },
  });
};

export const useSeasonTicketPlanApplicableEvents = (
  id: string,
  filters?: { cursor?: string; limit?: number }
) => {
  return useQuery({
    queryKey: seasonTicketsKeys.planApplicableEvents(id, filters),
    queryFn: () => seasonTicketsClient.getSeasonTicketPlanApplicableEvents(id, filters),
    staleTime: 10 * 60 * 1000,
  });
};

export const usePurchaseSeasonTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      data,
      idempotencyKey
    }: {
      planId: string;
      data: PurchaseSeasonTicketDto;
      idempotencyKey: IdempotencyKey;
    }) => seasonTicketsClient.purchaseSeasonTicket(planId, data, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonTicketsKeys.tickets() });
    },
  });
};

export const useSeasonTickets = (filters?: SeasonTicketFilters) => {
  return useQuery({
    queryKey: seasonTicketsKeys.ticketsList(filters),
    queryFn: () => seasonTicketsClient.getSeasonTickets(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSeasonTicketsInfinite = (filters?: Omit<SeasonTicketFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: seasonTicketsKeys.ticketsList(filters),
    queryFn: ({ pageParam }) => seasonTicketsClient.getSeasonTickets({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<SeasonTicket>) => lastPage.next,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for filtering season tickets by clientId (uses GET /season-tickets with filter)
export const useSeasonTicketsByClient = (clientId: string | null) => {
  return useQuery({
    queryKey: seasonTicketsKeys.ticketsList({ clientId: clientId! }),
    queryFn: () => seasonTicketsClient.getSeasonTickets({ clientId: clientId! }),
    enabled: Boolean(clientId),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.items, // Extract items array from PaginatedResponse
  });
};

// Legacy alias for backward compatibility
/**
 * @deprecated Use useSeasonTicketsByClient instead
 */
export const useCurrentUserSeasonTickets = () => useSeasonTicketsByClient(null);