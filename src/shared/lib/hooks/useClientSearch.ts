import { useMemo } from 'react';
import { useClientsInfinite, type Client } from '@/shared/api';
import { useDebounce } from './useDebounce';

interface UseClientSearchOptions {
  query: string;
  minQueryLength?: number;
  debounceMs?: number;
  enabled?: boolean;
  limit?: number;
}

interface UseClientSearchReturn {
  clients: Client[];
  isLoading: boolean;
  isFetching: boolean;
  debouncedQuery: string;
  shouldShowResults: boolean;
}

export function useClientSearch({
  query,
  minQueryLength = 2,
  debounceMs = 300,
  enabled = true,
  limit = 10,
}: UseClientSearchOptions): UseClientSearchReturn {
  const debouncedQuery = useDebounce(query, debounceMs);

  const shouldSearch = enabled && debouncedQuery.length >= minQueryLength;

  const { data, isLoading, isFetching } = useClientsInfinite(
    shouldSearch ? { q: debouncedQuery, limit } : { limit },
    { enabled: shouldSearch }
  );

  const clients = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data],
  );

  const shouldShowResults = shouldSearch && (isLoading || isFetching || clients.length > 0 || debouncedQuery.length >= minQueryLength);

  return {
    clients,
    isLoading,
    isFetching,
    debouncedQuery,
    shouldShowResults,
  };
}
