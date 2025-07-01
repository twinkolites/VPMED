import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
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
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import type { GalleryItem } from '../types'
import {
  fetchGalleryItems,
  createGalleryItem,
  updateGalleryItemWithImages,
  deleteGalleryItem,
  getGalleryStatistics,
  type CreateGalleryItemData
} from '../lib/galleryApi'

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
}

const GalleryManager: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({
    totalItems: 0,
    featuredItems: 0,
    averageRating: 0,
    categoryCounts: {
      'before-after': 0,
      'equipment': 0,
      'work-process': 0,
      'certifications': 0
    }
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const beforeFileInputRef = useRef<HTMLInputElement>(null)
  const afterFileInputRef = useRef<HTMLInputElement>(null)
  
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

  // Load gallery items and statistics on component mount
  useEffect(() => {
    loadGalleryData()
  }, [])

  const loadGalleryData = async () => {
    try {
      setLoading(true)
      const [itemsData, statsData] = await Promise.all([
        fetchGalleryItems(),
        getGalleryStatistics()
      ])
      setGalleryItems(itemsData)
      setStatistics(statsData)
    } catch (error) {
      console.error('Error loading gallery data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof GalleryItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (files: FileList | null, type: 'main' | 'before' | 'after' = 'main') => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const preview = e.target?.result as string
          setUploadedImages(prev => [
            ...prev.filter(img => img.type !== type), // Remove existing image of same type
            { file, preview, type }
          ])
        }
        reader.readAsDataURL(file)
      }
    })
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
      setLoading(true)
      
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
        await updateGalleryItemWithImages(editingItem.id, itemData)
      } else {
        await createGalleryItem(itemData)
      }

      await loadGalleryData() // Refresh data
      resetForm()
    } catch (error) {
      console.error('Error saving gallery item:', error)
    } finally {
      setLoading(false)
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
  }

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item)
    setFormData(item)
    setUploadedImages([]) // Reset images for edit mode
    setShowAddModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this gallery item?')) {
      try {
        setLoading(true)
        await deleteGalleryItem(id)
        await loadGalleryData() // Refresh data
      } catch (error) {
        console.error('Error deleting gallery item:', error)
      } finally {
        setLoading(false)
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

  const renderImageUploadArea = (type: 'main' | 'before' | 'after', label: string, inputRef: React.RefObject<HTMLInputElement | null>) => {
    const existingImage = uploadedImages.find(img => img.type === type)
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label} {type === 'main' && '*'}
        </label>
        
        {existingImage ? (
          <div className="relative">
            <img
              src={existingImage.preview}
              alt={`${label} preview`}
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => removeImage(type)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {existingImage.file.name}
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer ${
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
            <CloudArrowUpIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
            <div className="text-xs sm:text-sm text-gray-600 mb-2">
              <span className="font-medium text-emerald-600">Click to upload</span>
              <span className="hidden sm:inline"> or drag and drop</span>
            </div>
            <div className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</div>
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
              {/* Image Placeholder */}
              <div className="h-40 sm:h-48 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-t-2xl flex items-center justify-center relative overflow-hidden border-b border-gray-100">
                <div className={`p-3 sm:p-4 rounded-xl ${getCategoryColor(item.category)} bg-opacity-20`}>
                  <CategoryIcon className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600" />
                </div>
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold text-white ${getCategoryColor(item.category)}`}>
                    <span className="hidden sm:inline">{item.category.replace('-', ' ')}</span>
                    <span className="sm:hidden">{item.category.split('-')[0]}</span>
                  </span>
                </div>
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 hidden sm:block sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex gap-1">
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
            className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20 mx-4"
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4 sm:space-y-6">
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
                  <div className="space-y-4 sm:space-y-6">
                    {/* Main Image */}
                    {renderImageUploadArea('main', 'Main Image', fileInputRef)}
                    
                    {/* Before/After Images - Show only for before-after category */}
                    {formData.category === 'before-after' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {renderImageUploadArea('before', 'Before Image', beforeFileInputRef)}
                        {renderImageUploadArea('after', 'After Image', afterFileInputRef)}
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
    </div>
  )
}

export default GalleryManager 