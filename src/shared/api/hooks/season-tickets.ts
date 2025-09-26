import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { seasonTicketsClient } from '../clients/season-tickets';
import type { 
  SeasonTicketPlan, 
  SeasonTicketPlanUpdateDto,
  SeasonTicketPlanCreateDto,
  PaymentMethodRequest,
  SeasonTicketPlanFilters,
  SeasonTicketFilters,
  PaginatedResponse,
  IdempotencyKey,
} from '../types';

export const seasonTicketsKeys = {
  all: ['season-tickets'] as const,
  plans: () => [...seasonTicketsKeys.all, 'plans'] as const,
  plansList: (filters?: SeasonTicketPlanFilters) => [...seasonTicketsKeys.plans(), filters] as const,
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

export const usePurchaseSeasonTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      planId, 
      paymentMethod, 
      idempotencyKey 
    }: { 
      planId: string; 
      paymentMethod: PaymentMethodRequest;
      idempotencyKey: IdempotencyKey;
    }) => seasonTicketsClient.purchaseSeasonTicket(planId, paymentMethod, idempotencyKey),
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

export const useCurrentUserSeasonTickets = () => {
  const queryClient = useQueryClient();
  const getCurrentUserId = (): string | null => {
    const authData = queryClient.getQueryData(['auth', 'user', 'profile']) as { id?: string } | undefined;
    return authData?.id || null;
  };

  const userId = getCurrentUserId();
  return useQuery({
    queryKey: seasonTicketsKeys.ticketsList({ userId: userId! }),
    queryFn: () => seasonTicketsClient.getSeasonTickets({ userId: userId! }),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.items, // Extract items array from PaginatedResponse
  });
};