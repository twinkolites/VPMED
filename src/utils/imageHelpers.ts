/**
 * Image Helper Utilities for vpmed website
 * 
 * Instructions for adding your photos:
 * 1. Place your images in the src/assets/images/ folder
 * 2. Use these helper functions to import and use them in components
 * 3. For production builds, images will be optimized automatically by Vite
 */

// Helper function to get image URL from assets folder
export const getImageUrl = (imageName: string): string => {
  try {
    // For Vite, we use the import.meta.url approach
    return new URL(`../assets/images/${imageName}`, import.meta.url).href;
  } catch (error) {
    console.warn(`Image not found: ${imageName}`);
    return '';
  }
};

// Helper function to create image placeholder
export const createImagePlaceholder = (width: number = 400, height: number = 300, text: string = 'vpmed'): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
            fill="#6b7280" text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `)}`;
};

// Recommended image sizes for different sections
export const IMAGE_SIZES = {
  gallery: { width: 800, height: 600 },
  hero: { width: 1200, height: 800 },
  thumbnail: { width: 300, height: 200 },
  logo: { width: 200, height: 100 }
} as const;

// Common image file extensions supported
export const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.svg'] as const;

/**
 * Example usage in components:
 * 
 * import { getImageUrl, createImagePlaceholder } from '../utils/imageHelpers';
 * 
 * // For actual images
 * const imageUrl = getImageUrl('autoclave-repair.jpg');
 * 
 * // For placeholders during development
 * const placeholderUrl = createImagePlaceholder(800, 600, 'Coming Soon');
 * 
 * // In JSX
 * <img src={imageUrl || placeholderUrl} alt="Description" />
 */ 