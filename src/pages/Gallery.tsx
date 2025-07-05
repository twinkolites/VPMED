import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  Search, 
  Eye, 
  Calendar, 
  MapPin, 
  Star, 
  CheckCircle, 
  Award, 
  Clock,
  Wrench,
  Settings,
  Stethoscope,
  Activity,
  Shield,
  Zap,
  Heart,
  X,
  Camera as PhotoIcon,
  ZoomIn
} from 'lucide-react';
import type { GalleryItem } from '../types';
import { useGalleryOverview, usePrefetchGalleryData } from '../hooks/useGalleryData';
import { useLocation, useNavigate } from 'react-router-dom';
import LazyImage from '../components/LazyImage';

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<{ url: string; caption: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsToShow, setItemsToShow] = useState(20);

  const location = useLocation();
  const navigate = useNavigate();

  // Use React Query hook for gallery data
  const { data: galleryData, isLoading: loading, error } = useGalleryOverview();
  const { prefetchGalleryItems, prefetchGalleryItem } = usePrefetchGalleryData();

  // Extract data from query result
  const galleryItems = galleryData?.items || [];
  const totalCount = galleryData?.totalCount || 0;
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
  };

  // Handle error state
  if (error) {
    console.error('Error loading gallery items:', error);
  }

  // Effect to open specific modal if ID is present in URL
  useEffect(() => {
    if (!loading && galleryItems.length > 0) {
      const params = new URLSearchParams(location.search);
      const itemId = params.get('id');
      if (itemId) {
        const itemToOpen = galleryItems.find(item => item.id === itemId);
        if (itemToOpen) {
          setSelectedItem(itemToOpen);
          // Clear the ID from the URL to prevent re-opening on refresh
          navigate(location.pathname, { replace: true });
        }
      }
    }
  }, [loading, galleryItems, location, navigate]);

  // Helper function to get category icon similar to GalleryManager
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'before-after': return <Wrench className="w-4 h-4" />;
      case 'equipment': return <Settings className="w-4 h-4" />;
      case 'work-process': return <Activity className="w-4 h-4" />;
      case 'certifications': return <Award className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const categories = [
    { key: 'all', label: 'All Work', icon: <Eye className="w-4 h-4" />, count: statistics.totalItems },
    { key: 'before-after', label: 'Before & After', icon: <Wrench className="w-4 h-4" />, count: statistics.categoryCounts['before-after'] },
    { key: 'equipment', label: 'Equipment Service', icon: <Settings className="w-4 h-4" />, count: statistics.categoryCounts['equipment'] },
    { key: 'work-process', label: 'Work Process', icon: <Activity className="w-4 h-4" />, count: statistics.categoryCounts['work-process'] },
    { key: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" />, count: statistics.categoryCounts['certifications'] }
  ]

  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.equipment_type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  // Helper function to render images based on type and category
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
              <LazyImage 
                src={beforeImage.image_url} 
                alt={beforeImage.caption || `${item.title} - Before`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 relative">
              <LazyImage 
                src={afterImage.image_url} 
                alt={afterImage.caption || `${item.title} - After`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        );
      }
    }
    
    // For other categories or when before/after not available, show main image or gallery
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
                <LazyImage 
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
        <LazyImage 
          src={mainImage.image_url} 
          alt={mainImage.caption || item.alt_text || item.title}
          className="w-full h-full object-cover"
        />
      );
    }
    
    // Fallback to icon if no images available
    return (
      <div className="text-4xl sm:text-6xl text-green-600/20">
        {item.category === 'before-after' && <Wrench />}
        {item.category === 'equipment' && <Settings />}
        {item.category === 'work-process' && <Activity />}
        {item.category === 'certifications' && <Award />}
      </div>
    );
  };

  // Helper function to render images in modal with enhanced layout
  const renderModalImages = (item: GalleryItem) => {
    const images = item.gallery_images || [];
    
    // For before-after category, show enhanced before/after comparison
    if (item.category === 'before-after') {
      const beforeImage = images.find(img => img.image_type === 'before');
      const afterImage = images.find(img => img.image_type === 'after');
      
      if (beforeImage && afterImage) {
        return (
          <div className="w-full h-full">
            {/* Mobile: Stack vertically, Desktop: Side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 h-full gap-1">
              <div 
                className="relative h-full min-h-[120px] sm:min-h-full group cursor-pointer"
                onClick={() => setExpandedPhoto({ 
                  url: beforeImage.image_url, 
                  caption: beforeImage.caption || `${item.title} - Before` 
                })}
              >
                <LazyImage 
                  src={beforeImage.image_url} 
                  alt={beforeImage.caption || `${item.title} - Before`}
                  className="w-full h-full object-cover rounded-lg sm:rounded-none sm:rounded-l-lg"
                  priority={true}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-bold shadow-lg">
                  BEFORE
                </div>
              </div>
              <div 
                className="relative h-full min-h-[120px] sm:min-h-full group cursor-pointer"
                onClick={() => setExpandedPhoto({ 
                  url: afterImage.image_url, 
                  caption: afterImage.caption || `${item.title} - After` 
                })}
              >
                <LazyImage 
                  src={afterImage.image_url} 
                  alt={afterImage.caption || `${item.title} - After`}
                  className="w-full h-full object-cover rounded-lg sm:rounded-none sm:rounded-r-lg"
                  priority={true}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-green-500 text-white text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-bold shadow-lg">
                  AFTER
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
    
    // For other categories, show enhanced layouts based on category
    const mainImage = images.find(img => img.image_type === 'main') || images[0];
    const additionalImages = images.filter(img => img.image_type === 'additional');
    const allImages = [mainImage, ...additionalImages].filter(Boolean);
    
    // Equipment category: Show process grid if multiple images
    if (item.category === 'equipment' && allImages.length > 1) {
      const displayImages = allImages.slice(0, 6);
      return (
        <div className="w-full h-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 h-full gap-1">
            {displayImages.map((image, index) => (
              <div 
                key={index} 
                className="relative overflow-hidden group cursor-pointer"
                onClick={() => setExpandedPhoto({ 
                  url: image.image_url, 
                  caption: image.caption || `${item.title} - Step ${index + 1}` 
                })}
              >
                <LazyImage 
                  src={image.image_url} 
                  alt={image.caption || `${item.title} - Step ${index + 1}`}
                  className="w-full h-full object-cover"
                  priority={true}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
                <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded font-bold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          {allImages.length > 6 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
              +{allImages.length - 6} more
            </div>
          )}
        </div>
      );
    }
    
    // Work Process category: Show step-by-step process
    if (item.category === 'work-process' && allImages.length > 1) {
      const displayImages = allImages.slice(0, 4);
      return (
        <div className="w-full h-full">
          <div className="grid grid-cols-2 h-full gap-1">
            {displayImages.map((image, index) => (
              <div 
                key={index} 
                className="relative overflow-hidden group cursor-pointer"
                onClick={() => setExpandedPhoto({ 
                  url: image.image_url, 
                  caption: image.caption || `${item.title} - Process ${index + 1}` 
                })}
              >
                <LazyImage 
                  src={image.image_url} 
                  alt={image.caption || `${item.title} - Process ${index + 1}`}
                  className="w-full h-full object-cover"
                  priority={true}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
                <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-lg font-bold">
                  STEP {index + 1}
                </div>
              </div>
            ))}
          </div>
          {allImages.length > 4 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
              +{allImages.length - 4} more steps
            </div>
          )}
        </div>
      );
    }
    
    // Certifications: Show with certification badge
    if (mainImage) {
      return (
        <div 
          className="w-full h-full relative group cursor-pointer"
          onClick={() => setExpandedPhoto({ 
            url: mainImage.image_url, 
            caption: mainImage.caption || item.alt_text || item.title 
          })}
        >
          <LazyImage 
            src={mainImage.image_url} 
            alt={mainImage.caption || item.alt_text || item.title}
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <ZoomIn className="w-6 h-6 text-white" />
          </div>
          {item.category === 'certifications' && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white text-sm px-3 py-1.5 rounded-lg font-bold shadow-lg">
              CERTIFIED
            </div>
          )}
          {additionalImages.length > 0 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
              +{additionalImages.length} more
            </div>
          )}
        </div>
      );
    }
    
    // Fallback to enhanced icon display
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-6xl sm:text-8xl text-green-600/20">
          {item.category === 'before-after' && <Wrench />}
          {item.category === 'equipment' && <Settings />}
          {item.category === 'work-process' && <Activity />}
          {item.category === 'certifications' && <Award />}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section - Matching Services Page */}
      <section className="relative py-24 bg-gradient-to-br from-slate-900 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]"></div>
        
        {/* Floating Service Icons */}
        <div className="absolute top-20 left-20 hidden lg:block opacity-30">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Stethoscope className="w-8 h-8 text-green-400" />
          </motion.div>
        </div>
        <div className="absolute top-32 right-24 hidden lg:block opacity-30">
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Activity className="w-6 h-6 text-red-400" />
          </motion.div>
        </div>
        <div className="absolute bottom-32 left-24 hidden lg:block opacity-30">
          <motion.div
            animate={{ y: [-8, 12, -8] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            <Heart className="w-7 h-7 text-red-400" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Professional <span className="bg-gradient-to-r from-green-400 to-red-400 bg-clip-text text-transparent">Medical Equipment</span> Gallery
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Comprehensive showcase of our repair, maintenance, and compliance work for healthcare facilities. 
              Real results from certified technicians ensuring peak equipment performance.
            </p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">OEM</div>
                <div className="text-sm text-gray-400">Certified Parts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">30+</div>
                <div className="text-sm text-gray-400">Years Experience</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-6 sm:py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search projects or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 text-sm sm:text-base"
              />
            </div>

            {/* Category Filters - Hidden on mobile */}
            <div className="hidden sm:flex flex-wrap gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCategory(category.key)
                    setItemsToShow(20) // Reset items to show when category changes
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedCategory === category.key
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200 hover:border-green-300'
                  }`}
                >
                  {category.icon}
                  <span>{category.label}</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Mobile Category Filter - Show on mobile only */}
            <div className="flex sm:hidden flex-wrap gap-2">
              {categories.filter(category => category.key === 'all' || category.key === 'before-after').map((category) => (
                <motion.button
                  key={category.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCategory(category.key)
                    setItemsToShow(20) // Reset items to show when category changes
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-300 text-sm ${
                    selectedCategory === category.key
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200 hover:border-green-300'
                  }`}
                >
                  {category.icon}
                  <span>{category.label}</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <AnimatePresence>
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
            >
              {filteredItems.slice(0, itemsToShow).map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group border border-gray-200 hover:border-green-300 transition-all duration-300"
                >
                  {/* Image Display */}
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-green-100 to-red-100 flex items-center justify-center relative overflow-hidden">
                    {renderItemImage(item)}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-110"
                        title="View Details"
                      >
                        <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </button>
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold text-white bg-green-600">
                        {item.category.replace('-', ' ')}
                      </span>
                    </div>
                    
                    {/* Image Count Badge */}
                    {item.gallery_images && item.gallery_images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <PhotoIcon className="w-3 h-3" />
                        {item.gallery_images.length}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium self-start">
                        {item.category.replace('-', ' ')}
                      </span>
                      <div className="flex">
                        {renderStars(item.rating || 5)}
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    <div className="space-y-1 sm:space-y-2 text-xs text-gray-500">
                      {item.equipment_type && (
                        <div className="flex items-center gap-2">
                          <Settings className="w-3 h-3" />
                          <span className="truncate">{item.equipment_type}</span>
                        </div>
                      )}
                      {item.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}
                      {item.service_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>{item.service_date}</span>
                        </div>
                      )}
                    </div>

                    {item.testimonial && (
                      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 italic line-clamp-2">
                          "{item.testimonial}"
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedItem(item)}
                      className="mt-3 sm:mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Load More Button */}
          {filteredItems.length > itemsToShow && (
            <div className="text-center mt-8">
              <button
                onClick={() => setItemsToShow(prev => prev + 20)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Load More Gallery Items ({filteredItems.length - itemsToShow} remaining)
              </button>
            </div>
          )}

          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16"
            >
              <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
              </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No results found</h3>
            <p className="text-sm sm:text-base text-gray-500 px-4">Try adjusting your search terms or category filter.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Modal for detailed view */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto mx-2 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 sm:p-6">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 pr-2 sm:pr-4">{selectedItem.title}</h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="h-64 sm:h-80 bg-gradient-to-br from-green-100 to-red-100 rounded-lg mb-4 sm:mb-6 overflow-hidden">
                  {renderModalImages(selectedItem)}
                </div>

                <p className="text-gray-600 mb-3 sm:mb-6 text-sm sm:text-base">{selectedItem.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-6">
                  {selectedItem.equipment_type && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Equipment</label>
                      <p className="text-gray-900">{selectedItem.equipment_type}</p>
                    </div>
                  )}
                  {selectedItem.location && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900">{selectedItem.location}</p>
                    </div>
                  )}
                  {selectedItem.service_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date</label>
                      <p className="text-gray-900">{selectedItem.service_date}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rating</label>
                    <div className="flex">
                      {renderStars(selectedItem.rating || 5)}
                    </div>
                  </div>
                </div>

                {selectedItem.testimonial && (
                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-2">Client Testimonial</label>
                    <p className="text-gray-700 italic text-sm sm:text-base">"{selectedItem.testimonial}"</p>
                  </div>
                )}
                
                {/* Image Information */}
                {selectedItem.gallery_images && selectedItem.gallery_images.length > 0 && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mt-3 sm:mt-4">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-2">
                      Images ({selectedItem.gallery_images.length})
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                      {selectedItem.gallery_images.map((image, index) => (
                        <div key={image.id || index} className="text-center">
                          <div 
                            className="h-12 sm:h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-1 overflow-hidden group cursor-pointer relative"
                            onClick={() => setExpandedPhoto({ 
                              url: image.image_url, 
                              caption: image.caption || `${selectedItem.title} - ${image.image_type}` 
                            })}
                          >
                            <LazyImage 
                              src={image.image_url} 
                              alt={image.caption || `${selectedItem.title} - ${image.image_type}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                              <ZoomIn className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 capitalize font-medium">
                            {image.image_type.replace('-', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded photo modal */}
      <AnimatePresence>
        {expandedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
            onClick={() => setExpandedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[80vh] bg-white rounded-lg overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image container with fixed aspect ratio */}
              <div className="relative w-full h-[60vh] sm:h-[70vh] bg-gray-100 flex items-center justify-center">
                <LazyImage
                  src={expandedPhoto.url}
                  alt={expandedPhoto.caption}
                  className="max-w-full max-h-full object-contain"
                  priority={true}
                />
                
                {/* Close button */}
                <button
                  onClick={() => setExpandedPhoto(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              {/* Caption section */}
              {expandedPhoto.caption && (
                <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white border-t border-gray-200">
                  <p className="text-sm sm:text-base text-gray-700 text-center font-medium">{expandedPhoto.caption}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery; 