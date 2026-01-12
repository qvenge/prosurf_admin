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
import { adminKeys } from './admin';

export const clientsKeys = {
  all: ['clients'] as const,
  lists: () => [...clientsKeys.all, 'list'] as const,
  list: (filters?: ClientFilters) => [...clientsKeys.lists(), filters] as const,
  details: () => [...clientsKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientsKeys.details(), id] as const,
  seasonTickets: (id: string) => [...clientsKeys.detail(id), 'season-tickets'] as const,
  bonus: (id: string) => [...clientsKeys.detail(id), 'bonus'] as const,
} as const;

export const useClients = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: clientsKeys.list(filters),
    queryFn: () => clientsClient.getClients(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useClientsInfinite = (filters?: Omit<ClientFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: clientsKeys.list(filters),
    queryFn: ({ pageParam }) => clientsClient.getClients({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Client>) => lastPage.next,
    staleTime: 2 * 60 * 1000,
  });
};

export const useClient = (id: string) => {
  return useQuery({
    queryKey: clientsKeys.detail(id),
    queryFn: () => clientsClient.getClientById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientUpdateDto }) =>
      clientsClient.updateClient(id, data),
    onSuccess: (updatedClient, variables) => {
      queryClient.setQueryData(clientsKeys.detail(variables.id), updatedClient);
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminKeys.clientsAdminBase() });
    },
    onError: (error) => {
      console.error('Failed to update client:', error);
    },
  });
};

export const useClientSeasonTickets = (clientId: string) => {
  return useQuery({
    queryKey: clientsKeys.seasonTickets(clientId),
    queryFn: () => clientsClient.getClientSeasonTickets(clientId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useClientBonus = (clientId: string) => {
  return useQuery({
    queryKey: clientsKeys.bonus(clientId),
    queryFn: () => clientsClient.getClientBonus(clientId),
    staleTime: 1 * 60 * 1000,
  });
};

export const useGrantSeasonTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: AdminGrantSeasonTicketDto }) =>
      clientsClient.grantSeasonTicket(clientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.seasonTickets(variables.clientId) });
      queryClient.invalidateQueries({ queryKey: seasonTicketsKeys.tickets() });
    },
    onError: (error) => {
      console.error('Failed to grant season ticket:', error);
    },
  });
};
