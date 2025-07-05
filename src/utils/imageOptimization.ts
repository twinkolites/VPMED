// Image optimization utility for production deployment
export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  blur?: number
  sharpen?: boolean
}

// CDN providers configuration
export const CDN_PROVIDERS = {
  CLOUDINARY: 'cloudinary',
  IMAGEKIT: 'imagekit', 
  VERCEL: 'vercel',
  GENERIC: 'generic'
} as const

export type CDNProvider = typeof CDN_PROVIDERS[keyof typeof CDN_PROVIDERS]

// Environment configuration
const getImageCDNConfig = () => {
  // Check if we're in production and have environment variables
  const isProduction = import.meta.env.PROD
  const cloudinaryName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const imagekitId = import.meta.env.VITE_IMAGEKIT_ID
  const vercelUrl = import.meta.env.VITE_VERCEL_URL
  
  // Return configuration based on available environment variables
  if (isProduction && cloudinaryName) {
    return { provider: CDN_PROVIDERS.CLOUDINARY, cloudName: cloudinaryName }
  } else if (isProduction && imagekitId) {
    return { provider: CDN_PROVIDERS.IMAGEKIT, id: imagekitId }
  } else if (isProduction && vercelUrl) {
    return { provider: CDN_PROVIDERS.VERCEL, url: vercelUrl }
  } else {
    return { provider: CDN_PROVIDERS.GENERIC }
  }
}

// Check if URL should be optimized
const shouldOptimizeUrl = (url: string): boolean => {
  // Skip optimization for:
  // - Data URLs
  // - Blob URLs
  // - Relative URLs without extension
  // - URLs already optimized
  if (url.startsWith('data:') || 
      url.startsWith('blob:') || 
      url.includes('cloudinary.com') ||
      url.includes('imagekit.io') ||
      url.includes('vercel.app/_next/image') ||
      url.includes('?w=') ||
      url.includes('?quality=')) {
    return false
  }
  
  // Check if it's an image URL
  const imageExtensions = /\.(jpg|jpeg|png|webp|avif|gif)$/i
  return imageExtensions.test(url.split('?')[0])
}

// Cloudinary optimization
const optimizeWithCloudinary = (url: string, options: ImageOptimizationOptions, cloudName: string): string => {
  if (!shouldOptimizeUrl(url)) return url
  
  try {
    const transformations = []
    
    if (options.width) transformations.push(`w_${options.width}`)
    if (options.height) transformations.push(`h_${options.height}`)
    if (options.quality) transformations.push(`q_${options.quality}`)
    if (options.format && options.format !== 'auto') transformations.push(`f_${options.format}`)
    if (options.fit) transformations.push(`c_${options.fit}`)
    if (options.blur) transformations.push(`e_blur:${options.blur}`)
    if (options.sharpen) transformations.push(`e_sharpen`)
    
    // Auto format and quality for production
    if (!options.format) transformations.push('f_auto')
    if (!options.quality) transformations.push('q_auto')
    
    const transformString = transformations.join(',')
    
    // Handle different URL formats
    if (url.startsWith('http')) {
      const encodedUrl = encodeURIComponent(url)
      return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformString}/${encodedUrl}`
    } else {
      // Assume it's a Cloudinary public ID
      return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${url}`
    }
  } catch (error) {
    console.error('Error optimizing with Cloudinary:', error)
    return url
  }
}

// ImageKit optimization
const optimizeWithImageKit = (url: string, options: ImageOptimizationOptions, imagekitId: string): string => {
  if (!shouldOptimizeUrl(url)) return url
  
  try {
    const params = new URLSearchParams()
    
    if (options.width) params.append('w', options.width.toString())
    if (options.height) params.append('h', options.height.toString())
    if (options.quality) params.append('q', options.quality.toString())
    if (options.format && options.format !== 'auto') params.append('f', options.format)
    if (options.fit) params.append('c', options.fit)
    if (options.blur) params.append('bl', options.blur.toString())
    if (options.sharpen) params.append('e-sharpen', 'true')
    
    // Auto format and quality for production
    if (!options.format) params.append('f', 'auto')
    if (!options.quality) params.append('q', 'auto')
    
    const queryString = params.toString()
    
    if (url.startsWith('http')) {
      const encodedUrl = encodeURIComponent(url)
      return `https://ik.imagekit.io/${imagekitId}/fetch/${encodedUrl}?${queryString}`
    } else {
      return `https://ik.imagekit.io/${imagekitId}/${url}?${queryString}`
    }
  } catch (error) {
    console.error('Error optimizing with ImageKit:', error)
    return url
  }
}

// Vercel Image optimization
const optimizeWithVercel = (url: string, options: ImageOptimizationOptions, vercelUrl: string): string => {
  if (!shouldOptimizeUrl(url)) return url
  
  try {
    const params = new URLSearchParams()
    
    if (options.width) params.append('w', options.width.toString())
    if (options.height) params.append('h', options.height.toString())
    if (options.quality) params.append('q', (options.quality || 80).toString())
    
    const queryString = params.toString()
    const encodedUrl = encodeURIComponent(url)
    
    return `https://${vercelUrl}/_next/image?url=${encodedUrl}&${queryString}`
  } catch (error) {
    console.error('Error optimizing with Vercel:', error)
    return url
  }
}

// Generic optimization (fallback)
const optimizeGeneric = (url: string, options: ImageOptimizationOptions): string => {
  if (!shouldOptimizeUrl(url)) return url
  
  try {
    const urlObj = new URL(url, window.location.origin)
    const params = urlObj.searchParams
    
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', options.quality.toString())
    if (options.format && options.format !== 'auto') params.set('f', options.format)
    
    return urlObj.toString()
  } catch (error) {
    console.error('Error with generic optimization:', error)
    return url
  }
}

// Main optimization function
export const optimizeImage = (url: string, options: ImageOptimizationOptions = {}): string => {
  // Early return for URLs that shouldn't be optimized
  if (!shouldOptimizeUrl(url)) {
    return url
  }
  
  const config = getImageCDNConfig()
  
  try {
    switch (config.provider) {
      case CDN_PROVIDERS.CLOUDINARY:
        return optimizeWithCloudinary(url, options, config.cloudName!)
      case CDN_PROVIDERS.IMAGEKIT:
        return optimizeWithImageKit(url, options, config.id!)
      case CDN_PROVIDERS.VERCEL:
        return optimizeWithVercel(url, options, config.url!)
      default:
        return optimizeGeneric(url, options)
    }
  } catch (error) {
    console.error('Error in image optimization:', error)
    return url
  }
}

// Generate responsive image srcSet
export const generateSrcSet = (url: string, options: ImageOptimizationOptions = {}): string => {
  if (!shouldOptimizeUrl(url)) {
    return ''
  }
  
  try {
    const breakpoints = [320, 640, 768, 1024, 1280, 1920]
    const srcSetEntries = breakpoints.map(width => {
      const optimizedUrl = optimizeImage(url, { ...options, width })
      return `${optimizedUrl} ${width}w`
    })
    
    return srcSetEntries.join(', ')
  } catch (error) {
    console.error('Error generating srcSet:', error)
    return ''
  }
}

// Generate sizes attribute
export const generateSizes = (options: { 
  mobile?: string
  tablet?: string
  desktop?: string
} = {}): string => {
  const {
    mobile = '100vw',
    tablet = '50vw', 
    desktop = '33vw'
  } = options
  
  return `(max-width: 768px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`
}

// Detect optimal image format
export const detectOptimalFormat = (): 'avif' | 'webp' | 'jpeg' => {
  if (typeof window === 'undefined') return 'jpeg'
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  try {
    // Check for AVIF support
    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      return 'avif'
    }
    
    // Check for WebP support
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      return 'webp'
    }
    
    return 'jpeg'
  } catch (error) {
    return 'jpeg'
  }
}

// Get optimal quality based on format
export const getOptimalQuality = (format: string): number => {
  switch (format) {
    case 'avif':
      return 65
    case 'webp':
      return 80
    case 'jpeg':
      return 85
    default:
      return 80
  }
}

// Export utility functions
export const imageUtils = {
  optimizeImage,
  generateSrcSet,
  generateSizes,
  detectOptimalFormat,
  getOptimalQuality,
  shouldOptimizeUrl
} 