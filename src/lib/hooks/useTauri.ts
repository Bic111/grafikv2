'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseTauriQueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching data from Tauri backend or database
 * Provides automatic loading states and error handling
 *
 * @param queryFn - Async function that fetches data
 * @param deps - Dependencies array for re-fetching
 * @returns Query result with data, error, loading state, and refetch function
 */
export function useTauriQuery<T>(
  queryFn: () => Promise<T>,
  deps: React.DependencyList = []
): UseTauriQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [queryFn]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  return {
    data,
    error,
    isLoading,
    refetch: fetchData,
  };
}

export interface UseTauriMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
}

/**
 * Hook for mutations (create, update, delete operations)
 *
 * @param mutationFn - Async function that performs the mutation
 * @returns Mutation result with mutate function, data, error, and loading state
 */
export function useTauriMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>
): UseTauriMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await mutationFn(variables);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn]
  );

  return {
    mutate,
    data,
    error,
    isLoading,
  };
}
