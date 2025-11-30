import { useQuery } from '@tanstack/react-query';
import { cashbackClient } from '../clients/cashback';

export const cashbackKeys = {
  all: ['cashback'] as const,
  rules: () => [...cashbackKeys.all, 'rules'] as const,
  myWallet: () => [...cashbackKeys.all, 'my-wallet'] as const,
} as const;

/**
 * Hook to fetch cashback rules
 */
export const useCashbackRules = () => {
  return useQuery({
    queryKey: cashbackKeys.rules(),
    queryFn: () => cashbackClient.getCashbackRules(),
    staleTime: 30 * 60 * 1000, // 30 minutes - rules don't change often
  });
};

/**
 * Hook to fetch current client's cashback wallet
 * GET /clients/me/cashback
 */
export const useMyClientCashback = () => {
  return useQuery({
    queryKey: cashbackKeys.myWallet(),
    queryFn: () => cashbackClient.getMyClientCashback(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};