import { supabase } from './supabase';
import type { ShopProduct, ShopProductImage } from '../types';

// Fetch all shop products with images
export async function fetchShopProducts(): Promise<ShopProduct[]> {
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select(`
        *,
        shop_product_images (
          id,
          image_url,
          image_type,
          alt_text,
          sort_order
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shop products:', error);
      throw error;
    }

    // Transform data to include images array for backward compatibility
    const products = data?.map(product => ({
      ...product,
      images: product.shop_product_images
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
        ?.map((img: any) => img.image_url) || []
    })) || [];

    return products;
  } catch (error) {
    console.error('Error in fetchShopProducts:', error);
    throw error;
  }
}

// Fetch featured shop products
export async function fetchFeaturedShopProducts(): Promise<ShopProduct[]> {
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select(`
        *,
        shop_product_images (
          id,
          image_url,
          image_type,
          alt_text,
          sort_order
        )
      `)
      .eq('is_featured', true)
      .eq('in_stock', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured shop products:', error);
      throw error;
    }

    const products = data?.map(product => ({
      ...product,
      images: product.shop_product_images
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
        ?.map((img: any) => img.image_url) || []
    })) || [];

    return products;
  } catch (error) {
    console.error('Error in fetchFeaturedShopProducts:', error);
    throw error;
  }
}

// Fetch shop products by category
export async function fetchShopProductsByCategory(category: string): Promise<ShopProduct[]> {
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select(`
        *,
        shop_product_images (
          id,
          image_url,
          image_type,
          alt_text,
          sort_order
        )
      `)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shop products by category:', error);
      throw error;
    }

    const products = data?.map(product => ({
      ...product,
      images: product.shop_product_images
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
        ?.map((img: any) => img.image_url) || []
    })) || [];

    return products;
  } catch (error) {
    console.error('Error in fetchShopProductsByCategory:', error);
    throw error;
  }
}

// Create a new shop product with images
export async function createShopProduct(productData: Omit<ShopProduct, 'id' | 'created_at' | 'updated_at'>, images?: string[]): Promise<ShopProduct> {
  try {
    // Remove images from product data since it's handled separately
    const { images: _, ...productPayload } = productData;

    const { data: product, error: productError } = await supabase
      .from('shop_products')
      .insert([productPayload])
      .select()
      .single();

    if (productError) {
      console.error('Error creating shop product:', productError);
      throw productError;
    }

    // Add images if provided
    if (images && images.length > 0) {
      const imageInserts = images.map((imageUrl, index) => ({
        product_id: product.id,
        image_url: imageUrl,
        image_type: index === 0 ? 'main' : 'gallery',
        alt_text: productData.name,
        sort_order: index
      }));

      const { error: imageError } = await supabase
        .from('shop_product_images')
        .insert(imageInserts);

      if (imageError) {
        console.error('Error creating product images:', imageError);
        // Don't throw here, product was created successfully
      }
    }

    // Return the product with images
    const createdProduct = {
      ...product,
      images: images || []
    };

    return createdProduct;
  } catch (error) {
    console.error('Error in createShopProduct:', error);
    throw error;
  }
}

// Update a shop product with images
export async function updateShopProductWithImages(
  productId: string, 
  updates: Partial<ShopProduct>, 
  newImages?: string[]
): Promise<ShopProduct> {
  try {
    // Remove images and metadata fields from updates
    const { images: _, created_at, updated_at, ...productUpdates } = updates;

    const { data: product, error: productError } = await supabase
      .from('shop_products')
      .update(productUpdates)
      .eq('id', productId)
      .select()
      .single();

    if (productError) {
      console.error('Error updating shop product:', productError);
      throw productError;
    }

    // Update images if provided
    if (newImages) {
      // Delete existing images
      await supabase
        .from('shop_product_images')
        .delete()
        .eq('product_id', productId);

      // Insert new images
      if (newImages.length > 0) {
        const imageInserts = newImages.map((imageUrl, index) => ({
          product_id: productId,
          image_url: imageUrl,
          image_type: index === 0 ? 'main' : 'gallery',
          alt_text: product.name,
          sort_order: index
        }));

        const { error: imageError } = await supabase
          .from('shop_product_images')
          .insert(imageInserts);

        if (imageError) {
          console.error('Error updating product images:', imageError);
        }
      }
    }

    // Fetch updated product with images
    const updatedProduct = await fetchShopProductById(productId);
    return updatedProduct;
  } catch (error) {
    console.error('Error in updateShopProductWithImages:', error);
    throw error;
  }
}

// Update stock status
export async function updateStockStatus(productId: string, inStock: boolean, stockQuantity?: number): Promise<void> {
  try {
    const updates: any = { in_stock: inStock };
    if (stockQuantity !== undefined) {
      updates.stock_quantity = stockQuantity;
    }

    const { error } = await supabase
      .from('shop_products')
      .update(updates)
      .eq('id', productId);

    if (error) {
      console.error('Error updating stock status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateStockStatus:', error);
    throw error;
  }
}

// Toggle featured status
export async function toggleFeaturedStatus(productId: string): Promise<void> {
  try {
    // First get current status
    const { data: current, error: fetchError } = await supabase
      .from('shop_products')
      .select('is_featured')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('Error fetching current featured status:', fetchError);
      throw fetchError;
    }

    // Toggle the status
    const { error } = await supabase
      .from('shop_products')
      .update({ is_featured: !current.is_featured })
      .eq('id', productId);

    if (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in toggleFeaturedStatus:', error);
    throw error;
  }
}

// Delete a shop product
export async function deleteShopProduct(productId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('shop_products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting shop product:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteShopProduct:', error);
    throw error;
  }
}

// Get shop statistics
export async function getShopStatistics() {
  try {
    const { data: products, error } = await supabase
      .from('shop_products')
      .select('price, stock_quantity, in_stock, category');

    if (error) {
      console.error('Error fetching shop statistics:', error);
      throw error;
    }

    const totalProducts = products?.length || 0;
    const inStockProducts = products?.filter(p => p.in_stock).length || 0;
    const outOfStockProducts = totalProducts - inStockProducts;
    const totalValue = products?.reduce((sum, p) => sum + (p.price * (p.stock_quantity || 1)), 0) || 0;

    const categoryStats = products?.reduce((acc: any, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      totalValue,
      categoryStats
    };
  } catch (error) {
    console.error('Error in getShopStatistics:', error);
    throw error;
  }
}

// Fetch single product by ID
export async function fetchShopProductById(productId: string): Promise<ShopProduct> {
  try {
    const { data, error } = await supabase
      .from('shop_products')
      .select(`
        *,
        shop_product_images (
          id,
          image_url,
          image_type,
          alt_text,
          sort_order
        )
      `)
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching shop product by ID:', error);
      throw error;
    }

    const product = {
      ...data,
      images: data.shop_product_images
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
        ?.map((img: any) => img.image_url) || []
    };

    return product;
  } catch (error) {
    console.error('Error in fetchShopProductById:', error);
    throw error;
  }
} 