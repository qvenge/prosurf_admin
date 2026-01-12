import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bonusClient } from '../clients/bonus';
import { clientsKeys } from './clients';
import type { AdminAdjustBonusDto } from '../types';

export const bonusKeys = {
  all: ['bonus'] as const,
  rules: () => [...bonusKeys.all, 'rules'] as const,
  myWallet: () => [...bonusKeys.all, 'my-wallet'] as const,
} as const;

export const useBonusRules = () => {
  return useQuery({
    queryKey: bonusKeys.rules(),
    queryFn: () => bonusClient.getBonusRules(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useMyClientBonus = () => {
  return useQuery({
    queryKey: bonusKeys.myWallet(),
    queryFn: () => bonusClient.getMyClientBonus(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdjustBonus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AdminAdjustBonusDto) => bonusClient.adjustBonus(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.bonus(variables.clientId) });
    },
    onError: (error) => {
      console.error('Failed to adjust bonus:', error);
    },
  });
};
