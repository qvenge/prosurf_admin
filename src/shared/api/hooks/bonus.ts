import { useQuery } from '@tanstack/react-query';
import { bonusClient } from '../clients/bonus';

export const bonusKeys = {
  all: ['bonus'] as const,
  rules: () => [...bonusKeys.all, 'rules'] as const,
  myWallet: () => [...bonusKeys.all, 'my-wallet'] as const,
} as const;

/**
 * Hook to fetch bonus rules
 */
export const useBonusRules = () => {
  return useQuery({
    queryKey: bonusKeys.rules(),
    queryFn: () => bonusClient.getBonusRules(),
    staleTime: 30 * 60 * 1000, // 30 minutes - rules don't change often
  });
};

/**
 * Hook to fetch current client's bonus wallet
 * GET /clients/me/bonus
 */
export const useMyClientBonus = () => {
  return useQuery({
    queryKey: bonusKeys.myWallet(),
    queryFn: () => bonusClient.getMyClientBonus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
