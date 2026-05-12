import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';

/**
 * Thin wrapper around React Query's useQuery that ensures consistent
 * stale-time / retry semantics across the app. Components that need
 * different defaults can fall through to useQuery directly.
 */
export function useFetch<TData, TError = Error>(
  key: QueryKey,
  fetcher: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TData, TError, TData, QueryKey>({
    queryKey: key,
    queryFn: fetcher,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}
