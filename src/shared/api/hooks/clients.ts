import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { clientsClient } from '../clients/clients';
import type {
  Client,
  ClientUpdateDto,
  ClientFilters,
  PaginatedResponse,
  AdminGrantSeasonTicketDto,
} from '../types';
import { seasonTicketsKeys } from './season-tickets';

// Query key factory for clients
export const clientsKeys = {
  all: ['clients'] as const,
  lists: () => [...clientsKeys.all, 'list'] as const,
  list: (filters?: ClientFilters) => [...clientsKeys.lists(), filters] as const,
  details: () => [...clientsKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientsKeys.details(), id] as const,
  seasonTickets: (id: string) => [...clientsKeys.detail(id), 'season-tickets'] as const,
  bonus: (id: string) => [...clientsKeys.detail(id), 'bonus'] as const,
} as const;

/**
 * Clients hooks - for managing Telegram clients (end-users)
 */

// Get list of clients (ADMIN only)
export const useClients = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: clientsKeys.list(filters),
    queryFn: () => clientsClient.getClients(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Infinite query for clients list (ADMIN only)
export const useClientsInfinite = (filters?: Omit<ClientFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: clientsKeys.list(filters),
    queryFn: ({ pageParam }) => clientsClient.getClients({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Client>) => lastPage.next,
    staleTime: 2 * 60 * 1000,
  });
};

// Get client by ID (ADMIN only)
export const useClient = (id: string) => {
  return useQuery({
    queryKey: clientsKeys.detail(id),
    queryFn: () => clientsClient.getClientById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update client mutation (ADMIN only)
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientUpdateDto }) =>
      clientsClient.updateClient(id, data),
    onSuccess: (updatedClient, variables) => {
      // Update the specific client in cache
      queryClient.setQueryData(clientsKeys.detail(variables.id), updatedClient);

      // Invalidate client lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update client:', error);
    },
  });
};

// Get client's season tickets (ADMIN only)
export const useClientSeasonTickets = (clientId: string) => {
  return useQuery({
    queryKey: clientsKeys.seasonTickets(clientId),
    queryFn: () => clientsClient.getClientSeasonTickets(clientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get client's bonus wallet (ADMIN only)
export const useClientBonus = (clientId: string) => {
  return useQuery({
    queryKey: clientsKeys.bonus(clientId),
    queryFn: () => clientsClient.getClientBonus(clientId),
    staleTime: 1 * 60 * 1000, // 1 minute (financial data should be fresh)
  });
};

// Grant season ticket to client (ADMIN only)
export const useGrantSeasonTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: AdminGrantSeasonTicketDto }) =>
      clientsClient.grantSeasonTicket(clientId, data),
    onSuccess: (_, variables) => {
      // Invalidate client's season tickets
      queryClient.invalidateQueries({ queryKey: clientsKeys.seasonTickets(variables.clientId) });
      // Also invalidate the general season tickets list
      queryClient.invalidateQueries({ queryKey: seasonTicketsKeys.tickets() });
    },
    onError: (error) => {
      console.error('Failed to grant season ticket:', error);
    },
  });
};
