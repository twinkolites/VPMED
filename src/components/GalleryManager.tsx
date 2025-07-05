import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import type { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
  PlusIcon,
  PhotoIcon,
  XMarkIcon,
  StarIcon,
  CalendarIcon,
  MapPinIcon,
  WrenchIcon,
  CogIcon,
  ChartBarIcon,
  TrophyIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  ScissorsIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import type { GalleryItem } from '../types'
import {
  useGalleryOverview,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem
} from '../hooks/useGalleryData'
import type { CreateGalleryItemData } from '../lib/galleryApi'

const categories = [
  { value: 'before-after', label: 'Before & After', icon: WrenchIcon, color: 'bg-blue-500' },
  { value: 'equipment', label: 'Equipment Service', icon: CogIcon, color: 'bg-emerald-500' },
  { value: 'work-process', label: 'Work Process', icon: ChartBarIcon, color: 'bg-purple-500' },
  { value: 'certifications', label: 'Certifications', icon: TrophyIcon, color: 'bg-amber-500' }
]

interface UploadedImage {
  file: File;
  preview: string;
  type: 'main' | 'before' | 'after';
  cropped?: boolean;
}

interface CropModalState {
  isOpen: boolean;
  imageUrl: string;
  imageType: 'main' | 'before' | 'after';
  originalFile: File;
}

const GalleryManager: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [viewingItem, setViewingItem] = useState<GalleryItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isModalLoading, setIsModalLoading] = useState(false)
  const [cropModal, setCropModal] = useState<CropModalState>({
    isOpen: false,
    imageUrl: '',
    imageType: 'main',
    originalFile: new File([], '')
  })
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const beforeFileInputRef = useRef<HTMLInputElement>(null)
  const afterFileInputRef = useRef<HTMLInputElement>(null)
  const cropImageRef = useRef<HTMLImageElement>(null)
  
  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    title: '',
    description: '',
    category: 'before-after',
    location: '',
    service_date: new Date().toISOString().split('T')[0],
    equipment_type: '',
    testimonial: '',
    rating: 5,
    alt_text: ''
  })

  // Use React Query hooks
  const { data: galleryData, isLoading: loading, error } = useGalleryOverview()
  const createGalleryItemMutation = useCreateGalleryItem()
  const updateGalleryItemMutation = useUpdateGalleryItem()
  const deleteGalleryItemMutation = useDeleteGalleryItem()

  // Extract data from query result
  const galleryItems = galleryData?.items || []
  const statistics = galleryData?.statistics || {
    totalItems: 0,
    featuredItems: 0,
    averageRating: 0,
    categoryCounts: {
      'before-after': 0,
      'equipment': 0,
      'work-process': 0,
      'certifications': 0
    }
  }

  // Handle error state
  if (error) {
    console.error('Error loading gallery data:', error)
  }

  const handleInputChange = (field: keyof GalleryItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Cropping utility functions
  function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = crop.width
    canvas.height = crop.height

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        }
      }, 'image/jpeg', 0.95)
    })
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    )
    setCrop(crop)
  }, [])

  const handleImageUpload = (files: FileList | null, type: 'main' | 'before' | 'after' = 'main') => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const preview = e.target?.result as string
          setUploadedImages(prev => [
            ...prev.filter(img => img.type !== type), // Remove existing image of same type
            { file, preview, type, cropped: false }
          ])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const openCropModal = (imageUrl: string, imageType: 'main' | 'before' | 'after', originalFile: File) => {
    setCropModal({
      isOpen: true,
      imageUrl,
      imageType,
      originalFile
    })
  }

  const closeCropModal = () => {
    setCropModal({
      isOpen: false,
      imageUrl: '',
      imageType: 'main',
      originalFile: new File([], '')
    })
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

  const applyCrop = async () => {
    if (!completedCrop || !cropImageRef.current) return

    try {
      const croppedBlob = await getCroppedImg(cropImageRef.current, completedCrop)
      const croppedFile = new File([croppedBlob], cropModal.originalFile.name, {
        type: 'image/jpeg'
      })
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const croppedPreview = e.target?.result as string
        setUploadedImages(prev => [
          ...prev.filter(img => img.type !== cropModal.imageType),
          { 
            file: croppedFile, 
            preview: croppedPreview, 
            type: cropModal.imageType,
            cropped: true 
          }
        ])
      }
      reader.readAsDataURL(croppedFile)
      
      closeCropModal()
    } catch (error) {
      console.error('Error cropping image:', error)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent, type: 'main' | 'before' | 'after' = 'main') => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files, type)
    }
  }

  const removeImage = (type: 'main' | 'before' | 'after') => {
    setUploadedImages(prev => prev.filter(img => img.type !== type))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsModalLoading(true)
      
      // Prepare images array
      const images = uploadedImages.map((img, index) => ({
        image_url: img.preview, // In real app, this would be uploaded to storage first
        image_type: img.type,
        caption: '',
        sort_order: index
      }))

      const itemData: CreateGalleryItemData = {
        title: formData.title || '',
        description: formData.description || '',
        category: formData.category as GalleryItem['category'] || 'before-after',
        alt_text: formData.alt_text || formData.title || '',
        location: formData.location,
        service_date: formData.service_date,
        equipment_type: formData.equipment_type,
        testimonial: formData.testimonial,
        rating: formData.rating || 5,
        is_featured: false,
        images: images
      }

      if (editingItem) {
        await updateGalleryItemMutation.mutateAsync({ id: editingItem.id, data: itemData })
      } else {
        await createGalleryItemMutation.mutateAsync(itemData)
      }

      resetForm()
    } catch (error) {
      console.error('Error saving gallery item:', error)
    } finally {
      setIsModalLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'before-after',
      location: '',
      service_date: new Date().toISOString().split('T')[0],
      equipment_type: '',
      testimonial: '',
      rating: 5,
      alt_text: ''
    })
    setUploadedImages([])
    setShowAddModal(false)
    setEditingItem(null)
    setViewingItem(null)
    setIsModalLoading(false)
  }

  const handleEdit = async (item: GalleryItem) => {
    if (isModalLoading) return // Prevent multiple clicks
    
    setIsModalLoading(true)
    
    try {
      setEditingItem(item)
      setFormData(item)
      
      // Load existing images into the form - optimized for performance
      const existingImages: UploadedImage[] = []
      
      if (item.gallery_images && item.gallery_images.length > 0) {
        // Only load the first 3 images to avoid performance issues
        const imagesToLoad = item.gallery_images.slice(0, 3)
        
        imagesToLoad.forEach(img => {
          // Create a minimal file object for existing images
          const blob = new Blob([''], { type: 'image/jpeg' })
          const file = new File([blob], 'existing-image.jpg', { type: 'image/jpeg' })
          
          existingImages.push({
            file,
            preview: img.image_url,
            type: img.image_type as 'main' | 'before' | 'after',
            cropped: false
          })
        })
      }
      
      setUploadedImages(existingImages)
      setShowAddModal(true)
    } finally {
      setIsModalLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this gallery item?')) {
      try {
        await deleteGalleryItemMutation.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting gallery item:', error)
      }
    }
  }

  const filteredItems = galleryItems.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  )

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category)
    if (!cat) return WrenchIcon
    return cat.icon
  }

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat?.color || 'bg-gray-500'
  }

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => interactive && onChange && onChange(i + 1)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            {i < rating ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    )
  }

  // Helper function to render images based on type and category (similar to Gallery.tsx)
  const renderItemImage = (item: GalleryItem) => {
    const images = item.gallery_images || [];
    
    // For before-after category, show before/after comparison if available
    if (item.category === 'before-after') {
      const beforeImage = images.find(img => img.image_type === 'before');
      const afterImage = images.find(img => img.image_type === 'after');
      
      if (beforeImage && afterImage) {
        return (
          <div className="w-full h-full flex">
            <div className="flex-1 relative">
              <img 
                src={beforeImage.image_url} 
                alt={beforeImage.caption || `${item.title} - Before`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 relative">
              <img 
                src={afterImage.image_url} 
                alt={afterImage.caption || `${item.title} - After`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        );
      }
    }
    
    // For other categories, show main image or gallery grid
    const mainImage = images.find(img => img.image_type === 'main') || images[0];
    const additionalImages = images.filter(img => img.image_type === 'additional').slice(0, 3);
    
    // If we have multiple images for equipment/work-process, show a grid layout
    if ((item.category === 'equipment' || item.category === 'work-process') && images.length > 1) {
      const displayImages = [mainImage, ...additionalImages].filter(Boolean).slice(0, 4);
      
      if (displayImages.length > 1) {
        return (
          <div className="w-full h-full grid grid-cols-2 gap-0.5">
            {displayImages.map((image, index) => (
              <div key={index} className="relative overflow-hidden">
                <img 
                  src={image.image_url} 
                  alt={image.caption || item.alt_text || item.title}
                  className="w-full h-full object-cover"
                />
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+{images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }
    }
    
    // Single image display for certifications and single-image items
    if (mainImage) {
      return (
        <img 
          src={mainImage.image_url} 
          alt={mainImage.caption || item.alt_text || item.title}
          className="w-full h-full object-cover"
        />
      );
    }
    
    // Fallback to icon if no images available
    const CategoryIcon = getCategoryIcon(item.category);
    return (
      <div className={`p-3 sm:p-4 rounded-xl ${getCategoryColor(item.category)} bg-opacity-20`}>
        <CategoryIcon className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600" />
      </div>
    );
  };

  const renderImageUploadArea = (type: 'main' | 'before' | 'after', label: string, inputRef: React.RefObject<HTMLInputElement | null>) => {
    const existingImage = uploadedImages.find(img => img.type === type)
    
    return (
      <div className="w-full">
        {existingImage ? (
          <div className="relative">
            <img
              src={existingImage.preview}
              alt={`${label} preview`}
              className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200"
            />
            <div className="absolute top-1 right-1 flex gap-1">
              <button
                type="button"
                onClick={() => openCropModal(existingImage.preview, type, existingImage.file)}
                className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors z-10"
                title="Crop Image"
              >
                <ScissorsIcon className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => removeImage(type)}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                title="Remove Image"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded max-w-[70%] truncate flex items-center gap-1">
              {existingImage.cropped && <CheckIcon className="h-3 w-3 text-green-400" />}
              {existingImage.file.name !== 'existing-image.jpg' ? existingImage.file.name : 'Current image'}
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer ${
              dragActive 
                ? 'border-emerald-400 bg-emerald-50' 
                : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, type)}
            onClick={() => inputRef.current?.click()}
          >
            <CloudArrowUpIcon className="mx-auto h-6 w-6 text-gray-400 mb-2" />
            <div className="text-xs text-gray-600 mb-1">
              <span className="font-medium text-emerald-600">Click to upload</span>
            </div>
            <div className="text-xs text-gray-500">PNG, JPG, GIF</div>
          </div>
        )}
        
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={false}
          onChange={(e) => handleImageUpload(e.target.files, type)}
          className="hidden"
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 font-medium">Loading gallery items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">
            Gallery Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Manage showcase items for your medical equipment services
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="sm:inline">Add Gallery Item</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200 hover:border-emerald-300'
            }`}
          >
            All Items ({galleryItems.length})
          </button>
          {categories.map((category) => {
            const Icon = category.icon
            const count = galleryItems.filter(item => item.category === category.value).length
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm ${
                  selectedCategory === category.value
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200 hover:border-emerald-300'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Gallery Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredItems.map((item) => {
          const CategoryIcon = getCategoryIcon(item.category)
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Image Display */}
              <div className="h-40 sm:h-48 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-t-2xl flex items-center justify-center relative overflow-hidden border-b border-gray-100">
                {renderItemImage(item)}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold text-white ${getCategoryColor(item.category)}`}>
                    <span className="hidden sm:inline">{item.category.replace('-', ' ')}</span>
                    <span className="sm:hidden">{item.category.split('-')[0]}</span>
                  </span>
                </div>
                
                {/* Image Count Badge */}
                {item.gallery_images && item.gallery_images.length > 1 && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10">
                    <PhotoIcon className="w-3 h-3" />
                    {item.gallery_images.length}
                  </div>
                )}
                <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 hidden sm:block sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setViewingItem(item)}
                      className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-emerald-600 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate flex-1">{item.title}</h3>
                  <div className="flex-shrink-0">
                    {renderStars(item.rating || 5)}
                  </div>
                </div>
                
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="space-y-1 sm:space-y-2 text-xs text-gray-500 mb-3 sm:mb-4">
                  {item.equipment_type && (
                    <div className="flex items-center gap-2">
                      <CogIcon className="h-3 w-3" />
                      <span className="truncate">{item.equipment_type}</span>
                    </div>
                  )}
                  {item.location && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-3 w-3" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                  {item.service_date && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{new Date(item.service_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {item.testimonial && (
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4">
                    <p className="text-xs text-gray-600 italic line-clamp-2">
                      "{item.testimonial}"
                    </p>
                  </div>
                )}

                {/* Mobile Action Buttons */}
                <div className="flex gap-2 sm:hidden">
                  <button
                    onClick={() => setViewingItem(item)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <PhotoIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No gallery items found</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6 px-4">Start by adding your first gallery item to showcase your work.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base"
          >
            Add Your First Item
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl mx-4"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                        placeholder="e.g., Steris Autoclave Complete Restoration"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category || 'before-after'}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                      >
                        {categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Equipment and Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Equipment Type
                        </label>
                        <input
                          type="text"
                          value={formData.equipment_type || ''}
                          onChange={(e) => handleInputChange('equipment_type', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                          placeholder="e.g., Steris V-120 Autoclave"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Location
                        </label>
                        <input
                          type="text"
                          value={formData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                          placeholder="e.g., Metro General Hospital"
                        />
                      </div>
                    </div>

                    {/* Date and Rating */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Service Date
                        </label>
                        <input
                          type="date"
                          value={formData.service_date || ''}
                          onChange={(e) => handleInputChange('service_date', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Rating
                        </label>
                        <div className="flex items-center gap-2 p-2">
                          {renderStars(formData.rating || 5, true, (rating) => handleInputChange('rating', rating))}
                          <span className="text-sm text-gray-600 ml-2">{formData.rating || 5}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Images</h3>
                    
                    {/* Main Image - Compact */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Main Image *</label>
                      {renderImageUploadArea('main', 'Main Image', fileInputRef)}
                    </div>
                    
                    {/* Before/After Images - Show only for before-after category */}
                    {formData.category === 'before-after' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600">Before</label>
                          {renderImageUploadArea('before', 'Before', beforeFileInputRef)}
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600">After</label>
                          {renderImageUploadArea('after', 'After', afterFileInputRef)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none text-sm"
                    placeholder="Detailed description of the work performed..."
                  />
                </div>

                {/* Testimonial */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Client Testimonial
                  </label>
                  <textarea
                    rows={3}
                    value={formData.testimonial || ''}
                    onChange={(e) => handleInputChange('testimonial', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none text-sm"
                    placeholder="Client feedback about the service..."
                  />
                </div>

                {/* Alt Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Image Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.alt_text || ''}
                    onChange={(e) => handleInputChange('alt_text', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                    placeholder="Description for accessibility (auto-filled from title if empty)"
                  />
                </div>

                {/* Image Summary */}
                {uploadedImages.length > 0 && (
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-emerald-800 mb-2">Uploaded Images:</h4>
                    <div className="space-y-1">
                      {uploadedImages.map((img, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-emerald-700">
                          <DocumentIcon className="h-4 w-4" />
                          <span className="capitalize">{img.type}</span>: {img.file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors text-sm sm:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base order-1 sm:order-2"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
                      </motion.div>
          </div>
        )}

        {/* View Details Modal */}
        {viewingItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20 mx-4"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                    Gallery Item Details
                  </h2>
                  <button
                    onClick={() => setViewingItem(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                {/* Image Display */}
                <div className="h-48 sm:h-64 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg mb-4 sm:mb-6 overflow-hidden">
                  {renderItemImage(viewingItem)}
                </div>

                {/* Item Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{viewingItem.title}</h3>
                    <p className="text-gray-600 mb-4">{viewingItem.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold text-white ${getCategoryColor(viewingItem.category)}`}>
                          {viewingItem.category.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Rating:</span>
                        {renderStars(viewingItem.rating || 5)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {viewingItem.equipment_type && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Equipment Type</label>
                        <p className="text-gray-900">{viewingItem.equipment_type}</p>
                      </div>
                    )}
                    {viewingItem.location && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <p className="text-gray-900">{viewingItem.location}</p>
                      </div>
                    )}
                    {viewingItem.service_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Service Date</label>
                        <p className="text-gray-900">{new Date(viewingItem.service_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {viewingItem.testimonial && (
                  <div className="bg-emerald-50 p-4 rounded-lg mb-4 sm:mb-6">
                    <label className="text-sm font-medium text-gray-700 block mb-2">Client Testimonial</label>
                    <p className="text-gray-700 italic">"{viewingItem.testimonial}"</p>
                  </div>
                )}

                {/* Image Gallery */}
                {viewingItem.gallery_images && viewingItem.gallery_images.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 block mb-3">
                      Images ({viewingItem.gallery_images.length})
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {viewingItem.gallery_images.map((image, index) => (
                        <div key={image.id || index} className="text-center">
                          <div className="h-20 sm:h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg mb-2 overflow-hidden">
                            <img 
                              src={image.image_url} 
                              alt={image.caption || `${viewingItem.title} - ${image.image_type}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-xs text-gray-600 capitalize font-medium">
                            {image.image_type.replace('-', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-6 border-t border-gray-200">
                  <button
                    onClick={() => setViewingItem(null)}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors text-sm sm:text-base order-2 sm:order-1"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleEdit(viewingItem)
                      setViewingItem(null)
                    }}
                    className="w-full sm:flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base order-1 sm:order-2"
                  >
                    Edit Item
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Crop Modal */}
        {cropModal.isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl mx-4"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Crop Image - {cropModal.imageType.charAt(0).toUpperCase() + cropModal.imageType.slice(1)}
                  </h3>
                  <button
                    onClick={closeCropModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-[60vh] overflow-auto flex items-center justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={undefined}
                    minWidth={50}
                    minHeight={50}
                    className="max-w-full max-h-full"
                  >
                    <img
                      ref={cropImageRef}
                      src={cropModal.imageUrl}
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      className="max-w-full max-h-full object-contain"
                      style={{ maxHeight: '50vh' }}
                    />
                  </ReactCrop>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>How to crop:</strong> Drag the corners and edges of the selection box to adjust the crop area. 
                    The cropped image will maintain its original quality.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={closeCropModal}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyCrop}
                    disabled={!completedCrop}
                    className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base disabled:cursor-not-allowed"
                  >
                    Apply Crop
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    )
  }
  
  export default GalleryManager 