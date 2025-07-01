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
  X
} from 'lucide-react';
import type { GalleryItem } from '../types';
import { fetchGalleryItems } from '../lib/galleryApi';

const Gallery: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Load gallery items on component mount
  useEffect(() => {
    loadGalleryItems()
  }, [])

  const loadGalleryItems = async () => {
    try {
      setLoading(true)
      const items = await fetchGalleryItems()
      setGalleryItems(items)
    } catch (error) {
      console.error('Error loading gallery items:', error)
    } finally {
      setLoading(false)
    }
  }

const categories = [
  { key: 'all', label: 'All Work', icon: <Eye className="w-4 h-4" />, count: galleryItems.length },
  { key: 'before-after', label: 'Before & After', icon: <Wrench className="w-4 h-4" />, count: galleryItems.filter(item => item.category === 'before-after').length },
  { key: 'equipment', label: 'Equipment Service', icon: <Settings className="w-4 h-4" />, count: galleryItems.filter(item => item.category === 'equipment').length },
  { key: 'work-process', label: 'Work Process', icon: <Activity className="w-4 h-4" />, count: galleryItems.filter(item => item.category === 'work-process').length },
  { key: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" />, count: galleryItems.filter(item => item.category === 'certifications').length }
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">24hr</div>
                <div className="text-sm text-gray-400">Emergency Response</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">FDA</div>
                <div className="text-sm text-gray-400">Compliant Service</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">OEM</div>
                <div className="text-sm text-gray-400">Certified Parts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">15+</div>
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
                  onClick={() => setSelectedCategory(category.key)}
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
                  onClick={() => setSelectedCategory(category.key)}
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
              {filteredItems.map((item, index) => (
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
                  {/* Image Placeholder */}
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-green-100 to-red-100 flex items-center justify-center relative overflow-hidden">
                    <div className="text-4xl sm:text-6xl text-green-600/20">
                      {item.category === 'before-after' && <Wrench />}
                      {item.category === 'equipment' && <Settings />}
                      {item.category === 'work-process' && <Activity />}
                      {item.category === 'certifications' && <Award />}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
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
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 pr-4">{selectedItem.title}</h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="h-48 sm:h-64 bg-gradient-to-br from-green-100 to-red-100 rounded-lg mb-4 sm:mb-6 flex items-center justify-center">
                  <div className="text-6xl sm:text-8xl text-green-600/20">
                    {selectedItem.category === 'before-after' && <Wrench />}
                    {selectedItem.category === 'equipment' && <Settings />}
                    {selectedItem.category === 'work-process' && <Activity />}
                    {selectedItem.category === 'certifications' && <Award />}
                  </div>
                </div>

                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{selectedItem.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery; 