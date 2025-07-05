import { supabase } from './supabase'
import type { GalleryItem, } from '../types'

export interface CreateGalleryItemData {
  title: string
  description: string
  category: 'before-after' | 'equipment' | 'work-process' | 'certifications'
  alt_text?: string
  location?: string
  service_date?: string
  equipment_type?: string
  testimonial?: string
  rating: number
  is_featured?: boolean
  images?: Array<{
    image_url: string
    image_type: 'main' | 'before' | 'after' | 'additional'
    caption?: string
    sort_order: number
  }>
}

export interface GalleryFetchOptions {
  page?: number
  limit?: number
  category?: string
  featured?: boolean
  withImages?: boolean
}

// Optimized: Fetch gallery items with pagination and selective loading
export async function fetchGalleryItems(options: GalleryFetchOptions = {}): Promise<GalleryItem[]> {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      featured, 
      withImages = true 
    } = options

    let query = supabase
      .from('gallery_items')
      .select(
        withImages 
          ? `
            *,
            gallery_images (*)
          `
          : `
            *,
            gallery_images (*)
          `
      )

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    if (featured !== undefined) {
      query = query.eq('is_featured', featured)
    }

    // Apply pagination and ordering
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: items, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching gallery items:', error)
      throw error
    }

    return items || []
  } catch (error) {
    console.error('Failed to fetch gallery items:', error)
    throw error
  }
}

// Optimized: Fetch gallery overview (lightweight data for initial load)
export async function fetchGalleryOverview(): Promise<{
  items: GalleryItem[]
  totalCount: number
  statistics: any
}> {
  try {
    // Fetch first page with minimal data
    const { data: items, error: itemsError, count } = await supabase
      .from('gallery_items')
      .select(`
        *,
        gallery_images (*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(12)

    if (itemsError) {
      console.error('Error fetching gallery overview:', itemsError)
      throw itemsError
    }

    // Fetch statistics separately with minimal data
    const { data: statsData, error: statsError } = await supabase
      .from('gallery_items')
      .select('category, is_featured, rating')

    if (statsError) {
      console.error('Error fetching gallery statistics:', statsError)
      throw statsError
    }

    const statistics = {
      totalItems: count || 0,
      featuredItems: statsData?.filter(item => item.is_featured).length || 0,
      averageRating: statsData?.length > 0 
        ? statsData.reduce((sum, item) => sum + item.rating, 0) / statsData.length 
        : 0,
      categoryCounts: {
        'before-after': statsData?.filter(item => item.category === 'before-after').length || 0,
        'equipment': statsData?.filter(item => item.category === 'equipment').length || 0,
        'work-process': statsData?.filter(item => item.category === 'work-process').length || 0,
        'certifications': statsData?.filter(item => item.category === 'certifications').length || 0
      }
    }

    return {
      items: items || [],
      totalCount: count || 0,
      statistics
    }
  } catch (error) {
    console.error('Failed to fetch gallery overview:', error)
    throw error
  }
}

// Optimized: Fetch single gallery item with all images
export async function fetchGalleryItemById(id: string): Promise<GalleryItem | null> {
  try {
    const { data: item, error } = await supabase
      .from('gallery_items')
      .select(`
        *,
        gallery_images (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching gallery item:', error)
      throw error
    }

    return item
  } catch (error) {
    console.error('Failed to fetch gallery item:', error)
    throw error
  }
}

// Optimized: Fetch featured gallery items (lightweight)
export async function fetchFeaturedGalleryItems(): Promise<GalleryItem[]> {
  try {
    const { data: items, error } = await supabase
      .from('gallery_items')
      .select(`
        *,
        gallery_images (*)
      `)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6) // Limit featured items

    if (error) {
      console.error('Error fetching featured gallery items:', error)
      throw error
    }

    return items || []
  } catch (error) {
    console.error('Failed to fetch featured gallery items:', error)
    throw error
  }
}

// Optimized: Fetch gallery items by category with pagination
export async function fetchGalleryItemsByCategory(
  category: string, 
  options: { page?: number; limit?: number } = {}
): Promise<GalleryItem[]> {
  try {
    const { page = 1, limit = 12 } = options
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: items, error } = await supabase
      .from('gallery_items')
      .select(`
        *,
        gallery_images (*)
      `)
      .eq('category', category)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching gallery items by category:', error)
      throw error
    }

    return items || []
  } catch (error) {
    console.error('Failed to fetch gallery items by category:', error)
    throw error
  }
}

// Create a new gallery item with images
export async function createGalleryItem(itemData: CreateGalleryItemData): Promise<GalleryItem> {
  try {
    // Insert the main gallery item
    const { data: item, error: itemError } = await supabase
      .from('gallery_items')
      .insert([{
        title: itemData.title,
        description: itemData.description,
        category: itemData.category,
        alt_text: itemData.alt_text,
        location: itemData.location,
        service_date: itemData.service_date,
        equipment_type: itemData.equipment_type,
        testimonial: itemData.testimonial,
        rating: itemData.rating,
        is_featured: itemData.is_featured || false
      }])
      .select()
      .single()

    if (itemError) {
      console.error('Error creating gallery item:', itemError)
      throw itemError
    }

    // Insert images if provided
    if (itemData.images && itemData.images.length > 0) {
      const imagesToInsert = itemData.images.map((image, index) => ({
        gallery_item_id: item.id,
        image_url: image.image_url,
        image_type: image.image_type,
        caption: image.caption,
        sort_order: image.sort_order || index
      }))

      const { error: imagesError } = await supabase
        .from('gallery_images')
        .insert(imagesToInsert)

      if (imagesError) {
        console.error('Error creating gallery images:', imagesError)
        // Don't throw here, just log the error
      }
    }

    // Fetch the complete item with images
    const { data: completeItem, error: fetchError } = await supabase
      .from('gallery_items')
      .select(`
        *,
        gallery_images (*)
      `)
      .eq('id', item.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete gallery item:', fetchError)
      throw fetchError
    }

    return completeItem
  } catch (error) {
    console.error('Failed to create gallery item:', error)
    throw error
  }
}

// Update a gallery item with images
export async function updateGalleryItemWithImages(
  id: string,
  itemData: CreateGalleryItemData
): Promise<GalleryItem> {
  try {
    // Update the main gallery item
    const { data: item, error: itemError } = await supabase
      .from('gallery_items')
      .update({
        title: itemData.title,
        description: itemData.description,
        category: itemData.category,
        alt_text: itemData.alt_text,
        location: itemData.location,
        service_date: itemData.service_date,
        equipment_type: itemData.equipment_type,
        testimonial: itemData.testimonial,
        rating: itemData.rating,
        is_featured: itemData.is_featured || false
      })
      .eq('id', id)
      .select()
      .single()

    if (itemError) {
      console.error('Error updating gallery item:', itemError)
      throw itemError
    }

    // Delete existing images
    const { error: deleteImagesError } = await supabase
      .from('gallery_images')
      .delete()
      .eq('gallery_item_id', id)

    if (deleteImagesError) {
      console.error('Error deleting existing images:', deleteImagesError)
      throw deleteImagesError
    }

    // Insert new images if provided
    if (itemData.images && itemData.images.length > 0) {
      const imagesToInsert = itemData.images.map((image, index) => ({
        gallery_item_id: id,
        image_url: image.image_url,
        image_type: image.image_type,
        caption: image.caption,
        sort_order: image.sort_order || index
      }))

      const { error: imagesError } = await supabase
        .from('gallery_images')
        .insert(imagesToInsert)

      if (imagesError) {
        console.error('Error creating new gallery images:', imagesError)
        throw imagesError
      }
    }

    // Fetch the complete updated item with images
    const { data: completeItem, error: fetchError } = await supabase
      .from('gallery_items')
      .select(`
        *,
        gallery_images (*)
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete gallery item:', fetchError)
      throw fetchError
    }

    return completeItem
  } catch (error) {
    console.error('Failed to update gallery item with images:', error)
    throw error
  }
}

// Delete a gallery item (images will be deleted automatically due to CASCADE)
export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting gallery item:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to delete gallery item:', error)
    throw error
  }
}

// Get gallery statistics
export async function getGalleryStatistics() {
  try {
    const { data: items, error } = await supabase
      .from('gallery_items')
      .select('category, is_featured, rating')

    if (error) {
      console.error('Error fetching gallery statistics:', error)
      throw error
    }

    const stats = {
      totalItems: items?.length || 0,
      featuredItems: items?.filter(item => item.is_featured).length || 0,
      averageRating: items?.length > 0 
        ? items.reduce((sum, item) => sum + item.rating, 0) / items.length 
        : 0,
      categoryCounts: {
        'before-after': items?.filter(item => item.category === 'before-after').length || 0,
        'equipment': items?.filter(item => item.category === 'equipment').length || 0,
        'work-process': items?.filter(item => item.category === 'work-process').length || 0,
        'certifications': items?.filter(item => item.category === 'certifications').length || 0
      }
    }

    return stats
  } catch (error) {
    console.error('Failed to get gallery statistics:', error)
    throw error
  }
}

// Toggle featured status
export async function toggleFeaturedStatus(id: string, isFeatured: boolean): Promise<GalleryItem> {
  try {
    const { data: item, error } = await supabase
      .from('gallery_items')
      .update({ is_featured: isFeatured })
      .eq('id', id)
      .select(`
        *,
        gallery_images (*)
      `)
      .single()

    if (error) {
      console.error('Error toggling featured status:', error)
      throw error
    }

    return item
  } catch (error) {
    console.error('Failed to toggle featured status:', error)
    throw error
  }
} 