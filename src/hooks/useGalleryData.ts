import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  fetchGalleryOverview, 
  fetchGalleryItems, 
  fetchGalleryItemById,
  fetchFeaturedGalleryItems,
  createGalleryItem,
  updateGalleryItemWithImages,
  deleteGalleryItem,
  type GalleryFetchOptions,
  type CreateGalleryItemData 
} from '../lib/galleryApi'
import type { GalleryItem } from '../types'

// Query keys for consistent caching
export const galleryKeys = {
  all: ['gallery'] as const,
  overview: () => [...galleryKeys.all, 'overview'] as const,
  items: (options?: GalleryFetchOptions) => [...galleryKeys.all, 'items', options] as const,
  item: (id: string) => [...galleryKeys.all, 'item', id] as const,
  featured: () => [...galleryKeys.all, 'featured'] as const,
}

// Hook for gallery overview (initial load)
export const useGalleryOverview = () => {
  return useQuery({
    queryKey: galleryKeys.overview(),
    queryFn: fetchGalleryOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for paginated gallery items
export const useGalleryItems = (options?: GalleryFetchOptions) => {
  return useQuery({
    queryKey: galleryKeys.items(options),
    queryFn: () => fetchGalleryItems(options),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!options, // Only fetch when options are provided
  })
}

// Hook for single gallery item
export const useGalleryItem = (id: string) => {
  return useQuery({
    queryKey: galleryKeys.item(id),
    queryFn: () => fetchGalleryItemById(id),
    staleTime: 10 * 60 * 1000, // 10 minutes for individual items
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id,
  })
}

// Hook for featured gallery items
export const useFeaturedGalleryItems = () => {
  return useQuery({
    queryKey: galleryKeys.featured(),
    queryFn: fetchFeaturedGalleryItems,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Mutation hook for creating gallery items
export const useCreateGalleryItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGalleryItemData) => createGalleryItem(data),
    onSuccess: (newItem) => {
      // Update overview cache
      queryClient.setQueryData(galleryKeys.overview(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          items: [newItem, ...old.items.slice(0, 11)], // Keep only first 11 to maintain 12 total
          totalCount: old.totalCount + 1,
          statistics: {
            ...old.statistics,
            totalItems: old.statistics.totalItems + 1,
            categoryCounts: {
              ...old.statistics.categoryCounts,
              [newItem.category]: old.statistics.categoryCounts[newItem.category] + 1
            }
          }
        }
      })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: galleryKeys.items() })
      if (newItem.is_featured) {
        queryClient.invalidateQueries({ queryKey: galleryKeys.featured() })
      }
    },
  })
}

// Mutation hook for updating gallery items
export const useUpdateGalleryItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateGalleryItemData }) => 
      updateGalleryItemWithImages(id, data),
    onSuccess: (updatedItem) => {
      // Update specific item cache
      queryClient.setQueryData(galleryKeys.item(updatedItem.id), updatedItem)
      
      // Update overview cache
      queryClient.setQueryData(galleryKeys.overview(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          items: old.items.map((item: GalleryItem) => 
            item.id === updatedItem.id ? updatedItem : item
          )
        }
      })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: galleryKeys.items() })
      queryClient.invalidateQueries({ queryKey: galleryKeys.featured() })
    },
  })
}

// Mutation hook for deleting gallery items
export const useDeleteGalleryItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteGalleryItem(id),
    onSuccess: (_, deletedId) => {
      // Remove from overview cache
      queryClient.setQueryData(galleryKeys.overview(), (old: any) => {
        if (!old) return old
        const deletedItem = old.items.find((item: GalleryItem) => item.id === deletedId)
        return {
          ...old,
          items: old.items.filter((item: GalleryItem) => item.id !== deletedId),
          totalCount: old.totalCount - 1,
          statistics: {
            ...old.statistics,
            totalItems: old.statistics.totalItems - 1,
            categoryCounts: {
              ...old.statistics.categoryCounts,
              [deletedItem?.category]: Math.max(0, old.statistics.categoryCounts[deletedItem?.category] - 1)
            }
          }
        }
      })

      // Remove from cache
      queryClient.removeQueries({ queryKey: galleryKeys.item(deletedId) })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: galleryKeys.items() })
      queryClient.invalidateQueries({ queryKey: galleryKeys.featured() })
    },
  })
}

// Prefetch hook for preloading data
export const usePrefetchGalleryData = () => {
  const queryClient = useQueryClient()

  const prefetchGalleryItems = (options?: GalleryFetchOptions) => {
    queryClient.prefetchQuery({
      queryKey: galleryKeys.items(options),
      queryFn: () => fetchGalleryItems(options),
      staleTime: 3 * 60 * 1000,
    })
  }

  const prefetchGalleryItem = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: galleryKeys.item(id),
      queryFn: () => fetchGalleryItemById(id),
      staleTime: 10 * 60 * 1000,
    })
  }

  return { prefetchGalleryItems, prefetchGalleryItem }
} 