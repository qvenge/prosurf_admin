import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waitlistClient } from '../clients/waitlist';
import { sessionsKeys } from './sessions';
import type { WaitlistFilters, IdempotencyKey } from '../types';

export const waitlistKeys = {
  all: ['waitlist'] as const,
  userWaitlist: (userId: string, filters?: WaitlistFilters) => 
    [...waitlistKeys.all, 'user', userId, filters] as const,
} as const;

export const useJoinWaitlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, idempotencyKey }: { sessionId: string; idempotencyKey: IdempotencyKey }) => 
      waitlistClient.joinWaitlist(sessionId, idempotencyKey),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.detail(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: waitlistKeys.all });
    },
  });
};

export const useUserWaitlist = (userId: string, filters?: WaitlistFilters) => {
  return useQuery({
    queryKey: waitlistKeys.userWaitlist(userId, filters),
    queryFn: () => waitlistClient.getUserWaitlist(userId, filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCurrentUserWaitlist = () => {
  const queryClient = useQueryClient();
  const getCurrentUserId = (): string | null => {
    const authData = queryClient.getQueryData(['auth', 'user', 'profile']) as { id?: string } | undefined;
    return authData?.id || null;
  };

  const userId = getCurrentUserId();
  return useQuery({
    queryKey: waitlistKeys.userWaitlist(userId!),
    queryFn: () => waitlistClient.getUserWaitlist(userId!),
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000,
  });
};