// Image optimization utilities for CDN integration and performance

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number | 'auto'
  format?: 'auto' | 'webp' | 'jpg' | 'png' | 'avif'
  fit?: 'crop' | 'contain' | 'cover' | 'fill' | 'scale'
  gravity?: 'center' | 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'
  blur?: number
  brightness?: number
  contrast?: number
  saturation?: number
}

export interface CDNProvider {
  name: string
  transform: (url: string, options: ImageOptimizationOptions) => string
}

// Cloudinary CDN Provider
const cloudinaryProvider: CDNProvider = {
  name: 'cloudinary',
  transform: (url: string, options: ImageOptimizationOptions) => {
    // Extract public ID from Cloudinary URL if applicable
    const cloudinaryRegex = /(?:cloudinary\.com\/[^\/]+\/image\/upload\/)(?:v\d+\/)?(.+)$/
    const match = url.match(cloudinaryRegex)
    
    if (!match) return url // Not a Cloudinary URL, return as-is
    
    const publicId = match[1]
    const transformations: string[] = []
    
    if (options.width) transformations.push(`w_${options.width}`)
    if (options.height) transformations.push(`h_${options.height}`)
    if (options.quality) transformations.push(`q_${options.quality}`)
    if (options.format) transformations.push(`f_${options.format}`)
    if (options.fit) transformations.push(`c_${options.fit}`)
    if (options.gravity) transformations.push(`g_${options.gravity}`)
    if (options.blur) transformations.push(`e_blur:${options.blur}`)
    if (options.brightness) transformations.push(`e_brightness:${options.brightness}`)
    if (options.contrast) transformations.push(`e_contrast:${options.contrast}`)
    if (options.saturation) transformations.push(`e_saturation:${options.saturation}`)
    
    const transformation = transformations.join(',')
    const baseUrl = url.split('/upload/')[0] + '/upload/'
    
    return `${baseUrl}${transformation ? transformation + '/' : ''}${publicId}`
  }
}

// ImageKit CDN Provider
const imagekitProvider: CDNProvider = {
  name: 'imagekit',
  transform: (url: string, options: ImageOptimizationOptions) => {
    const imagekitRegex = /^https?:\/\/ik\.imagekit\.io\/[^\/]+\//
    
    if (!imagekitRegex.test(url)) return url // Not an ImageKit URL
    
    const params: string[] = []
    
    if (options.width) params.push(`w-${options.width}`)
    if (options.height) params.push(`h-${options.height}`)
    if (options.quality) params.push(`q-${options.quality}`)
    if (options.format) params.push(`f-${options.format}`)
    if (options.fit) {
      const ik_fit = options.fit === 'crop' ? 'crop' : 
                    options.fit === 'contain' ? 'pad_resize' : 
                    options.fit === 'cover' ? 'maintain_ratio' : 'force'
      params.push(`c-${ik_fit}`)
    }
    if (options.blur) params.push(`bl-${options.blur}`)
    if (options.brightness) params.push(`e-brightness_${options.brightness}`)
    if (options.contrast) params.push(`e-contrast_${options.contrast}`)
    if (options.saturation) params.push(`e-saturation_${options.saturation}`)
    
    if (params.length === 0) return url
    
    const transformation = `tr:${params.join(',')}`
    return url.replace(imagekitRegex, (match) => `${match}${transformation}/`)
  }
}

// Vercel Image Optimization
const vercelProvider: CDNProvider = {
  name: 'vercel',
  transform: (url: string, options: ImageOptimizationOptions) => {
    const params = new URLSearchParams()
    
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality && typeof options.quality === 'number') {
      params.set('q', Math.min(100, Math.max(1, options.quality)).toString())
    }
    
    const paramString = params.toString()
    if (!paramString) return url
    
    // Encode the original URL
    const encodedUrl = encodeURIComponent(url)
    return `/_next/image?url=${encodedUrl}&${paramString}`
  }
}

// Generic query parameter based CDN
const genericProvider: CDNProvider = {
  name: 'generic',
  transform: (url: string, options: ImageOptimizationOptions) => {
    const urlObj = new URL(url)
    
    if (options.width) urlObj.searchParams.set('w', options.width.toString())
    if (options.height) urlObj.searchParams.set('h', options.height.toString())
    if (options.quality) urlObj.searchParams.set('q', options.quality.toString())
    if (options.format) urlObj.searchParams.set('f', options.format)
    if (options.fit) urlObj.searchParams.set('fit', options.fit)
    
    return urlObj.toString()
  }
}

// Auto-detect CDN provider based on URL
export const detectCDNProvider = (url: string): CDNProvider => {
  if (url.includes('cloudinary.com')) return cloudinaryProvider
  if (url.includes('ik.imagekit.io')) return imagekitProvider
  if (url.includes('vercel.app') || url.includes('vercel.com')) return vercelProvider
  return genericProvider
}

// Main optimization function
export const optimizeImageUrl = (
  url: string, 
  options: ImageOptimizationOptions = {},
  cdnProvider?: CDNProvider
): string => {
  if (!url) return ''
  
  // Use provided CDN provider or auto-detect
  const provider = cdnProvider || detectCDNProvider(url)
  
  // Apply default optimizations for performance
  const defaultOptions: ImageOptimizationOptions = {
    quality: 'auto',
    format: 'auto',
    ...options
  }
  
  return provider.transform(url, defaultOptions)
}

// Responsive image srcSet generator
export const generateSrcSet = (
  url: string,
  widths: number[] = [320, 640, 1024, 1280, 1920],
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string => {
  return widths
    .map(width => {
      const optimizedUrl = optimizeImageUrl(url, { ...options, width })
      return `${optimizedUrl} ${width}w`
    })
    .join(', ')
}

// Generate sizes attribute for responsive images
export const generateSizes = (breakpoints: { [key: string]: string } = {
  '(max-width: 640px)': '100vw',
  '(max-width: 1024px)': '50vw',
  '(max-width: 1280px)': '33vw',
  default: '25vw'
}): string => {
  const entries = Object.entries(breakpoints)
  const mediaQueries = entries.slice(0, -1).map(([query, size]) => `${query} ${size}`)
  const defaultSize = breakpoints.default || '100vw'
  
  return [...mediaQueries, defaultSize].join(', ')
}

// Preload critical images
export const preloadImage = (url: string, options: ImageOptimizationOptions = {}): void => {
  const optimizedUrl = optimizeImageUrl(url, options)
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = optimizedUrl
  
  // Add srcset for responsive preloading if width is specified
  if (options.width) {
    const srcSet = generateSrcSet(url, [options.width], options)
    link.setAttribute('imagesrcset', srcSet)
  }
  
  document.head.appendChild(link)
}

// Image format support detection
export const getSupportedFormat = (): 'avif' | 'webp' | 'jpg' => {
  // Check for AVIF support
  const avifSupport = new Promise<boolean>((resolve) => {
    const avif = new Image()
    avif.onload = () => resolve(true)
    avif.onerror = () => resolve(false)
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  })

  // Check for WebP support
  const webpSupport = new Promise<boolean>((resolve) => {
    const webp = new Image()
    webp.onload = () => resolve(true)
    webp.onerror = () => resolve(false)
    webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })

  // Return best supported format
  return Promise.all([avifSupport, webpSupport]).then(([avif, webp]) => {
    if (avif) return 'avif'
    if (webp) return 'webp'
    return 'jpg'
  }) as any // Type assertion needed due to Promise handling
}

// Cached format detection result
let supportedFormat: 'avif' | 'webp' | 'jpg' | null = null

export const getCachedSupportedFormat = (): 'avif' | 'webp' | 'jpg' => {
  if (supportedFormat) return supportedFormat
  
  // Simple sync detection (less accurate but immediate)
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  // Check WebP support
  const webpData = canvas.toDataURL('image/webp')
  if (webpData.indexOf('data:image/webp') === 0) {
    supportedFormat = 'webp'
    return 'webp'
  }
  
  supportedFormat = 'jpg'
  return 'jpg'
}

// Utility for gallery-specific optimizations
export const getGalleryImageUrl = (
  url: string,
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'
): string => {
  const sizeConfig = {
    thumbnail: { width: 300, height: 200, quality: 80 },
    medium: { width: 800, height: 600, quality: 85 },
    large: { width: 1200, height: 900, quality: 90 },
    original: { quality: 95 }
  }
  
  const config = sizeConfig[size]
  const format = getCachedSupportedFormat()
  
  return optimizeImageUrl(url, {
    ...config,
    format: format,
    fit: 'cover'
  })
}

// Responsive image component helper
export const getResponsiveImageProps = (
  url: string,
  alt: string,
  options: ImageOptimizationOptions = {}
) => {
  const optimizedUrl = optimizeImageUrl(url, options)
  const srcSet = generateSrcSet(url, undefined, options)
  const sizes = generateSizes()
  
  return {
    src: optimizedUrl,
    srcSet,
    sizes,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const
  }
} 