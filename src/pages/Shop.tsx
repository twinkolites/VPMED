import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  ShoppingCart, 
  Star, 
  Heart,
  Eye,
  Calendar, 
  MapPin,
  CheckCircle, 
  Award, 
  Clock,
  Truck,
  Shield,
  Zap,
  Activity,
  X,
  Plus,
  Minus,
  Tag,
  Package,
  Wrench,
  Stethoscope,
  Bed,
  Users,
  Settings,
  Monitor,
  Phone
} from 'lucide-react';
import type { ShopProduct } from '../types';
import { fetchShopProducts } from '../lib/shopApi';

const categories = [
  { key: 'all', label: 'All Products', icon: <Package className="w-4 h-4" />, count: 0 },
  { key: 'hospital-beds', label: 'Hospital Beds', icon: <Bed className="w-4 h-4" />, count: 0 },
  { key: 'wheelchairs', label: 'Wheelchairs', icon: <Users className="w-4 h-4" />, count: 0 },
  { key: 'monitoring', label: 'Monitoring', icon: <Monitor className="w-4 h-4" />, count: 0 },
  { key: 'parts', label: 'Parts & Accessories', icon: <Settings className="w-4 h-4" />, count: 0 }
];

const conditions = [
  { key: 'all', label: 'All Conditions' },
  { key: 'new', label: 'New', color: 'bg-green-100 text-green-800' },
  { key: 'refurbished', label: 'Refurbished', color: 'bg-blue-100 text-blue-800' },
  { key: 'used-excellent', label: 'Used - Excellent', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'used-good', label: 'Used - Good', color: 'bg-orange-100 text-orange-800' }
];

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchShopProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || product.condition === selectedCondition;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesCategory && matchesCondition && matchesSearch && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0; // featured order
    }
  });

  // Update category counts
  const updatedCategories = categories.map(cat => ({
    ...cat,
    count: cat.key === 'all' 
      ? products.length 
      : products.filter(p => p.category === cat.key).length
  }));

  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString()}`;
  };

  const getConditionColor = (condition: string) => {
    const conditionData = conditions.find(c => c.key === condition);
    return conditionData?.color || 'bg-gray-100 text-gray-800';
  };

  const calculateDiscount = (price: number, original_price?: number) => {
    if (!original_price || original_price <= price) return 0;
    return Math.round(((original_price - price) / original_price) * 100);
  };

  const handleProductView = (product: ShopProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleContactUs = (product: ShopProduct) => {
    // Store product info in sessionStorage for the contact page
    sessionStorage.setItem('inquiryProduct', JSON.stringify({
      name: product.name,
      price: product.price,
      brand: product.brand,
      model: product.model,
      category: product.category
    }));
    
    // Navigate to contact page
    navigate('/contact');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Product Details Modal Component
  const ProductModal = ({ product }: { product: ShopProduct }) => {
    const discount = calculateDiscount(product.price, product.original_price);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={closeModal}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="relative p-6 border-b border-gray-200">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 pr-12">{product.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getConditionColor(product.condition)}`}>
                {product.condition.replace('-', ' ')}
              </span>
              {product.brand && (
                <span className="text-gray-600 font-medium">{product.brand}</span>
              )}
              {product.model && (
                <span className="text-gray-500">Model: {product.model}</span>
              )}
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Product Image Placeholder */}
              <div className="space-y-4">
                <div className="h-80 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center relative">
                  <div className="text-8xl text-green-600/20">
                    {product.category === 'hospital-beds' && <Bed />}
                    {product.category === 'wheelchairs' && <Users />}
                    {product.category === 'monitoring' && <Monitor />}
                    {product.category === 'parts' && <Settings />}
                  </div>
                  
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg font-bold">
                      {discount}% OFF
                    </div>
                  )}
                  
                  {/* Stock Status */}
                  <div className={`absolute top-4 right-4 px-3 py-2 rounded-lg font-semibold ${
                    product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.in_stock ? 'Available' : 'Contact Us'}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                
                {/* Price Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                      {product.original_price && (
                        <div className="text-lg text-gray-500 line-through">
                          {formatPrice(product.original_price)}
                        </div>
                      )}
                    </div>
                    {product.stock_quantity && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Available</div>
                        <div className="font-semibold text-green-600">
                          {product.stock_quantity} units
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Specifications */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-gray-900 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                                 {/* Additional Info */}
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div className="bg-blue-50 rounded-lg p-3">
                     <div className="font-medium text-blue-900">Category</div>
                     <div className="text-blue-700 capitalize">{product.category.replace('-', ' ')}</div>
                   </div>
                   {product.warranty && (
                     <div className="bg-green-50 rounded-lg p-3">
                       <div className="font-medium text-green-900">Warranty</div>
                       <div className="text-green-700">{product.warranty}</div>
                     </div>
                   )}
                 </div>

                {/* Contact Button */}
                <motion.button
                  onClick={() => handleContactUs(product)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 text-lg"
                >
                  <Phone className="w-5 h-5" />
                  Contact Us About This Product
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section - Matching Gallery Page */}
      <section className="relative py-24 bg-gradient-to-br from-slate-900 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]"></div>
        
        {/* Floating Equipment Icons */}
        <div className="absolute top-20 left-20 hidden lg:block opacity-30">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bed className="w-8 h-8 text-green-400" />
          </motion.div>
        </div>
        <div className="absolute top-32 right-24 hidden lg:block opacity-30">
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Users className="w-6 h-6 text-red-400" />
          </motion.div>
        </div>
        <div className="absolute bottom-32 left-24 hidden lg:block opacity-30">
          <motion.div
            animate={{ y: [-8, 12, -8] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            <Monitor className="w-7 h-7 text-blue-400" />
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
              Available <span className="bg-gradient-to-r from-green-400 to-red-400 bg-clip-text text-transparent">Medical Equipment</span> 
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Browse our current inventory of quality hospital equipment, parts, and accessories. 
              Contact us directly for pricing, availability, and to schedule viewing.
            </p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">Expert</div>
                <div className="text-sm text-gray-400">Inspected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">Quality</div>
                <div className="text-sm text-gray-400">Guaranteed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">Direct</div>
                <div className="text-sm text-gray-400">Contact</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">Fast</div>
                <div className="text-sm text-gray-400">Response</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              />
            </div>

            {/* Condition Filter */}
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
            >
              {conditions.map((condition) => (
                <option key={condition.key} value={condition.key}>
                  {condition.label}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-gray-600 font-medium">
                {sortedProducts.length} products found
              </span>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mt-6">
            {updatedCategories.map((category) => (
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
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <AnimatePresence>
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {sortedProducts.map((product, index) => {
                const discount = calculateDiscount(product.price, product.original_price);
                
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden group border border-gray-200 hover:border-green-300 transition-all duration-300"
                  >
                    {/* Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center relative overflow-hidden">
                      <div className="text-6xl text-green-600/20">
                        {product.category === 'hospital-beds' && <Bed />}
                        {product.category === 'wheelchairs' && <Users />}
                        {product.category === 'monitoring' && <Monitor />}
                        {product.category === 'parts' && <Settings />}
                      </div>
                      
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                          {discount}% OFF
                        </div>
                      )}
                      
                      {/* Stock Status */}
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold ${
                        product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.in_stock ? 'Available' : 'Contact Us'}
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <motion.button
                          onClick={() => handleProductView(product)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 bg-white/90 rounded-full text-gray-700 hover:text-green-600 transition-colors shadow-lg"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                        <motion.button 
                          onClick={() => handleContactUs(product)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 bg-white/90 rounded-full text-gray-700 hover:text-blue-600 transition-colors shadow-lg"
                        >
                          <Phone className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getConditionColor(product.condition)}`}>
                          {product.condition.replace('-', ' ')}
                        </span>
                        {product.brand && (
                          <span className="text-xs text-gray-500 font-medium">{product.brand}</span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </div>
                          {product.original_price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.original_price)}
                            </div>
                          )}
                        </div>
                        {product.stock_quantity && (
                          <div className="text-xs text-gray-500">
                            {product.stock_quantity} available
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      {product.features && product.features.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs text-gray-500 mb-1">Key Features:</div>
                          <div className="text-xs text-gray-600">
                            {product.features.slice(0, 2).join(' • ')}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleContactUs(product)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          Contact Us
                        </button>
                        <button 
                          onClick={() => handleProductView(product)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {sortedProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Interested in Our Equipment?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Contact us directly for detailed specifications, pricing, and viewing appointments.
            </p>
            <motion.button
              onClick={() => navigate('/contact')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              Get In Touch
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Product Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedProduct && (
          <ProductModal product={selectedProduct} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop; 