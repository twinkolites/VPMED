import React, { useState, useRef, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { optimizeImage, generateSrcSet, generateSizes, imageUtils } from '../utils/imageOptimization'
import type { ImageOptimizationOptions } from '../utils/imageOptimization'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
  quality?: number
  sizes?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  width?: number
  height?: number
  fit?: 'crop' | 'contain' | 'cover' | 'fill' | 'scale'
  responsive?: boolean
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNSAyNUg3NVY3NUgyNVYyNVoiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+',
  onLoad,
  onError,
  quality = 80,
  sizes,
  loading = 'lazy',
  priority = false,
  width,
  height,
  fit = 'cover',
  responsive = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>(placeholder)
  const [imageSrcSet, setImageSrcSet] = useState<string>('')
  const imgRef = useRef<HTMLImageElement>(null)
  
  // Use intersection observer for lazy loading
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px', // Preload 50px before entering viewport
  })

  useEffect(() => {
    // Load image when in view or if priority is set
    if (inView || priority) {
      loadImage()
    }
  }, [inView, priority, src])

  const loadImage = () => {
    // Skip optimization for data URLs and blob URLs
    if (!imageUtils.shouldOptimizeUrl(src)) {
      setImageSrc(src)
      return
    }

    try {
      // Generate optimized image URL
      const optimizedUrl = optimizeImage(src, {
        quality,
        width,
        height,
        format: 'auto'
      })
      
      // Generate srcSet for responsive images
      let srcSet = ''
      if (responsive) {
        srcSet = generateSrcSet(src, { quality })
      }
      
      setImageSrc(optimizedUrl)
      setImageSrcSet(srcSet)
    } catch (error) {
      console.error('Error optimizing image:', error)
      setImageSrc(src) // Fallback to original URL
    }
  }

  // Generate sizes attribute for responsive images
  const generateSizesProp = () => {
    if (sizes) return sizes
    if (responsive && imageUtils.shouldOptimizeUrl(src)) {
      return generateSizes()
    }
    return undefined
  }

  return (
    <div 
      ref={inViewRef} 
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: '100px' }} // Prevent layout shift
    >
      <img
        ref={imgRef}
        src={imageSrc}
        srcSet={imageSrcSet || undefined}
        sizes={generateSizesProp()}
        alt={alt}
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${isError ? 'opacity-50' : ''}
        `}
        loading={loading}
        decoding="async"
        onLoad={() => {
          if (imageSrc !== placeholder) {
            setIsLoaded(true)
            onLoad?.()
          }
        }}
        onError={() => {
          setIsError(true)
          onError?.()
        }}
      />
      
      {/* Loading skeleton */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded-md animate-pulse"></div>
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LazyImage

// Progressive image loading component with WebP support
export const ProgressiveLazyImage: React.FC<LazyImageProps & { webpSrc?: string }> = ({
  src,
  webpSrc,
  alt,
  className = '',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>()
  const [isLoaded, setIsLoaded] = useState(false)
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px 0px',
  })

  useEffect(() => {
    if (inView) {
      // Check for WebP support
      const supportsWebP = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 1
        canvas.height = 1
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
      }

      // Use WebP if supported and available, otherwise use original
      const finalSrc = webpSrc && supportsWebP() ? webpSrc : src
      setImageSrc(finalSrc)
    }
  }, [inView, src, webpSrc])

  return (
    <div ref={inViewRef} className={`relative overflow-hidden ${className}`}>
      {imageSrc && (
        <LazyImage
          src={imageSrc}
          alt={alt}
          className="w-full h-full"
          priority={true} // Already controlled by intersection observer
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
    </div>
  )
} 