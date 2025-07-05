import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce cache times for production
      staleTime: 2 * 60 * 1000, // 2 minutes
      // Keep data in cache for 5 minutes  
      gcTime: 5 * 60 * 1000,
      // Reduce retries for production
      retry: 2,
      // Disable aggressive refetching for production
      refetchOnWindowFocus: false,
      // Only refetch on reconnect if data is stale
      refetchOnReconnect: 'always',
      // Add network mode for better offline handling
      networkMode: 'online',
      // Add error handling
      throwOnError: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Don't throw on error
      throwOnError: false,
    }
  },
}) 