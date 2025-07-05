import React, { useState, useRef, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { optimizeImageUrl, generateSrcSet, generateSizes, getCachedSupportedFormat } from '../utils/imageOptimization'
import type { ImageOptimizationOptions } from '../utils/imageOptimization'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
  quality?: 'low' | 'medium' | 'high'
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
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz48cGF0aCBkPSJNNTAgMTAwSDEwMFYxNTBINTBWMTAwWiIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTA1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjEyIj5JbWFnZTwvdGV4dD48L3N2Zz4=',
  onLoad,
  onError,
  quality = 'medium',
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
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [imageSrcSet, setImageSrcSet] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)

  // Use intersection observer for lazy loading
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px 0px', // Load images 50px before they come into view
    skip: priority // Skip intersection observer if high priority
  })

  // Create optimization options
  const optimizationOptions: ImageOptimizationOptions = {
    width,
    height,
    quality: quality === 'high' ? 90 : quality === 'medium' ? 75 : 60,
    format: getCachedSupportedFormat(),
    fit
  }

  // Load image when in view or if high priority
  useEffect(() => {
    if (inView || priority) {
      const img = new Image()
      
      // For data URLs and blob URLs, skip optimization
      const isDataUrl = src.startsWith('data:') || src.startsWith('blob:')
      const optimizedSrc = isDataUrl ? src : optimizeImageUrl(src, optimizationOptions)
      
      // Generate responsive srcSet if responsive is enabled and not a data URL
      let srcSet = ''
      if (responsive && !width && !isDataUrl) {
        srcSet = generateSrcSet(src, undefined, optimizationOptions)
      }
      
      img.onload = () => {
        setImageSrc(optimizedSrc)
        setImageSrcSet(srcSet)
        setIsLoaded(true)
        onLoad?.()
      }
      
      img.onerror = () => {
        setIsError(true)
        onError?.()
      }
      
      img.src = optimizedSrc
      
      // Set sizes for responsive images (skip for data URLs)
      if (sizes && !isDataUrl) {
        img.sizes = sizes
      }
    }
  }, [inView, priority, src, optimizationOptions, responsive, width, sizes, onLoad, onError])

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
        sizes={sizes || (responsive && !src.startsWith('data:') && !src.startsWith('blob:') ? generateSizes() : undefined)}
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