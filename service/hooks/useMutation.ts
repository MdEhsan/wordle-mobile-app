import { useCallback, useState } from 'react';
import { apiService } from '../api.service';
import { RequestConfig } from '../api.types';

type MutationMethod = 'post' | 'put';

interface UseMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  config?: RequestConfig;
}

interface UseMutationReturn<TData, TVariables> {
  data: TData | null;
  loading: boolean;
  error: Error | null;
  mutate: (variables: TVariables) => Promise<TData | null>;
  reset: () => void;
}

/**
 * Custom hook for POST and PUT requests
 * @param method - HTTP method (post, put)
 * @param endpoint - API endpoint
 * @param options - Mutation options (onSuccess, onError, config)
 * @returns Object with data, loading, error states and mutate function
 */
export function useMutation<TData = any, TVariables = any>(
  method: MutationMethod,
  endpoint: string,
  options: UseMutationOptions = {}
): UseMutationReturn<TData, TVariables> {
  const { onSuccess, onError, config } = options;
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      try {
        setLoading(true);
        setError(null);

        let result: TData;
        if (method === 'post') {
          result = await apiService.post<TData>(endpoint, variables, config);
        } else {
          result = await apiService.put<TData>(endpoint, variables, config);
        }

        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError = err instanceof Error ? err : new Error('Mutation failed');
        setError(apiError);
        onError?.(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [method, endpoint, config, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, mutate, reset };
}

/**
 * Convenience hooks for specific HTTP methods
 */
export function usePost<TData = any, TVariables = any>(
  endpoint: string,
  options?: UseMutationOptions
) {
  return useMutation<TData, TVariables>('post', endpoint, options);
}

export function usePut<TData = any, TVariables = any>(
  endpoint: string,
  options?: UseMutationOptions
) {
  return useMutation<TData, TVariables>('put', endpoint, options);
}
