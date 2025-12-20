import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../api.service';
import { RequestConfig } from '../api.types';

interface UseFetchOptions {
  immediate?: boolean;
  config?: RequestConfig;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for GET requests with automatic fetching
 * @param endpoint - API endpoint to fetch from
 * @param options - Fetch options (immediate, config)
 * @returns Object with data, loading, error states and refetch function
 */
export function useFetch<T>(
  endpoint: string,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const { immediate = true, config } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.get<T>(endpoint, config);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [endpoint, config]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
