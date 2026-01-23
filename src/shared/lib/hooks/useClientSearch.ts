import { useMemo } from 'react';
import { useClientsAdmin, type Client } from '@/shared/api';
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

/**
 * Normalize search query: remove formatting characters (spaces, brackets, dashes)
 * to support phone input with formatting like "+7 (900) 123-45-67"
 */
const normalizeSearchQuery = (query: string): string =>
  query.replace(/[\s\(\)\-]/g, '');

export function useClientSearch({
  query,
  minQueryLength = 2,
  debounceMs = 300,
  enabled = true,
  limit = 10,
}: UseClientSearchOptions): UseClientSearchReturn {
  const debouncedQuery = useDebounce(query, debounceMs);

  const normalizedQuery = normalizeSearchQuery(debouncedQuery);
  const shouldSearch = enabled && normalizedQuery.length >= minQueryLength;

  const { data, isLoading, isFetching } = useClientsAdmin(
    { search: normalizedQuery, limit },
    { enabled: shouldSearch }
  );

  const clients = useMemo(
    () => data?.items ?? [],
    [data],
  );

  const shouldShowResults = shouldSearch && (isLoading || isFetching || clients.length > 0 || normalizedQuery.length >= minQueryLength);

  return {
    clients,
    isLoading,
    isFetching,
    debouncedQuery: normalizedQuery,
    shouldShowResults,
  };
}
