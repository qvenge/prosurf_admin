import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { adminClient } from '../clients/admin';
import { REFRESH_INTERVALS } from '../config/refresh-intervals';
import type {
  Admin,
  AdminCreateDto,
  AdminUpdateDto,
  AdminSelfUpdateDto,
  ChangePasswordDto,
  AdminFilters,
  AuditLog,
  AuditLogFilters,
  PaginatedResponse,
  ClientAdminFilters,
  EventAdminFilters,
  SessionAdminFilters,
  SeasonTicketPlanAdminFilters,
} from '../types';

export const adminKeys = {
  all: ['admin'] as const,
  admins: () => [...adminKeys.all, 'admins'] as const,
  adminsList: (filters?: AdminFilters) => [...adminKeys.admins(), 'list', filters] as const,
  adminDetail: (id: string) => [...adminKeys.admins(), 'detail', id] as const,
  me: () => [...adminKeys.all, 'me'] as const,
  auditLogs: (filters?: AuditLogFilters) => [...adminKeys.all, 'audit-logs', filters] as const,
  jobs: () => [...adminKeys.all, 'jobs'] as const,
  clientsAdminBase: () => [...adminKeys.all, 'clients-admin'] as const,
  eventsAdminBase: () => [...adminKeys.all, 'events-admin'] as const,
  sessionsAdminBase: () => [...adminKeys.all, 'sessions-admin'] as const,
  seasonTicketPlansAdminBase: () => [...adminKeys.all, 'season-ticket-plans-admin'] as const,
  clientsAdmin: (filters?: ClientAdminFilters) => [...adminKeys.clientsAdminBase(), filters] as const,
  eventsAdmin: (filters?: EventAdminFilters) => [...adminKeys.eventsAdminBase(), filters] as const,
  sessionsAdmin: (filters?: SessionAdminFilters) => [...adminKeys.sessionsAdminBase(), filters] as const,
  seasonTicketPlansAdmin: (filters?: SeasonTicketPlanAdminFilters) => [...adminKeys.seasonTicketPlansAdminBase(), filters] as const,
} as const;

export const useAdmins = (filters?: AdminFilters) => {
  return useQuery({
    queryKey: adminKeys.adminsList(filters),
    queryFn: () => adminClient.getAdmins(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useAdminsInfinite = (filters?: Omit<AdminFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: adminKeys.adminsList(filters),
    queryFn: ({ pageParam }) => adminClient.getAdmins({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Admin>) => lastPage.next,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAdmin = (id: string) => {
  return useQuery({
    queryKey: adminKeys.adminDetail(id),
    queryFn: () => adminClient.getAdminById(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateDto) => adminClient.createAdmin(data),
    onSuccess: (newAdmin) => {
      queryClient.setQueryData(adminKeys.adminDetail(newAdmin.id), newAdmin);
      queryClient.invalidateQueries({ queryKey: adminKeys.admins() });
    },
    onError: (error) => {
      console.error('Failed to create admin:', error);
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateDto }) =>
      adminClient.updateAdmin(id, data),
    onSuccess: (updatedAdmin, variables) => {
      queryClient.setQueryData(adminKeys.adminDetail(variables.id), updatedAdmin);
      queryClient.invalidateQueries({ queryKey: adminKeys.admins() });
    },
    onError: (error) => {
      console.error('Failed to update admin:', error);
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminClient.deleteAdmin(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: adminKeys.adminDetail(deletedId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.admins() });
    },
    onError: (error) => {
      console.error('Failed to delete admin:', error);
    },
  });
};

export const useAdminMe = () => {
  return useQuery({
    queryKey: adminKeys.me(),
    queryFn: () => adminClient.getMe(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateAdminMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminSelfUpdateDto) => adminClient.updateMe(data),
    onSuccess: (updatedAdmin) => {
      queryClient.setQueryData(adminKeys.me(), updatedAdmin);
      queryClient.setQueryData(adminKeys.adminDetail(updatedAdmin.id), updatedAdmin);
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordDto) => adminClient.changePassword(data),
    onError: (error) => {
      console.error('Failed to change password:', error);
    },
  });
};

export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: adminKeys.auditLogs(filters),
    queryFn: () => adminClient.getAuditLogs(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAuditLogsInfinite = (filters?: Omit<AuditLogFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: adminKeys.auditLogs(filters),
    queryFn: ({ pageParam }) => adminClient.getAuditLogs({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<AuditLog>) => lastPage.next,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRunBookingExpiryJob = () => {
  return useMutation({
    mutationFn: () => adminClient.runBookingExpiryJob(),
  });
};

export const useRunCertificateExpiryJob = () => {
  return useMutation({
    mutationFn: () => adminClient.runCertificateExpiryJob(),
  });
};

export const useRunSeasonTicketExpiryJob = () => {
  return useMutation({
    mutationFn: () => adminClient.runSeasonTicketExpiryJob(),
  });
};

export const useClientsAdmin = (filters?: ClientAdminFilters) => {
  return useQuery({
    queryKey: adminKeys.clientsAdmin(filters),
    queryFn: () => adminClient.getClientsAdmin(filters),
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.ADMIN_VIEWS,
    refetchIntervalInBackground: false,
  });
};

export const useEventsAdmin = (filters?: EventAdminFilters) => {
  return useQuery({
    queryKey: adminKeys.eventsAdmin(filters),
    queryFn: () => adminClient.getEventsAdmin(filters),
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.ADMIN_VIEWS,
    refetchIntervalInBackground: false,
  });
};

export const useSessionsAdmin = (filters?: SessionAdminFilters, enabled = true) => {
  return useQuery({
    queryKey: adminKeys.sessionsAdmin(filters),
    queryFn: () => adminClient.getSessionsAdmin(filters),
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.ADMIN_VIEWS,
    refetchIntervalInBackground: false,
    enabled,
  });
};

export const useSeasonTicketPlansAdmin = (filters?: SeasonTicketPlanAdminFilters) => {
  return useQuery({
    queryKey: adminKeys.seasonTicketPlansAdmin(filters),
    queryFn: () => adminClient.getSeasonTicketPlansAdmin(filters),
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.ADMIN_VIEWS,
    refetchIntervalInBackground: false,
  });
};
