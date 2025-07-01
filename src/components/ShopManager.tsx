import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  Filter,
  ShoppingCart,
  Calendar,
  DollarSign,
  Tag,
  CheckCircle,
  AlertTriangle,
  Bed,
  Users,
  Monitor,
  Settings,
  X
} from 'lucide-react';
import type { ShopProduct } from '../types';
import {
  fetchShopProducts,
  createShopProduct,
  updateShopProductWithImages,
  deleteShopProduct,
  updateStockStatus,
  getShopStatistics
} from '../lib/shopApi';

// Categories configuration
const categories = [
  { key: 'all', label: 'All Products', icon: <Package className="w-4 h-4" />, count: 0 },
  { key: 'hospital-beds', label: 'Hospital Beds', icon: <Bed className="w-4 h-4" />, count: 0 },
  { key: 'wheelchairs', label: 'Wheelchairs', icon: <Users className="w-4 h-4" />, count: 0 },
  { key: 'monitoring', label: 'Monitoring', icon: <Monitor className="w-4 h-4" />, count: 0 },
  { key: 'parts', label: 'Parts & Accessories', icon: <Settings className="w-4 h-4" />, count: 0 }
];

// Common features for medical equipment
const commonFeatures = [
  'Electric height adjustment',
  'Manual crank operation',
  'Side rails included',
  'Lockable wheels',
  'Pressure relief',
  'Antimicrobial surface',
  'Easy to clean',
  'Lightweight design',
  'Foldable',
  'Battery backup',
  'Digital display',
  'Alarm system',
  'Auto-calibration',
  'Wireless connectivity',
  'USB charging port',
  'Ergonomic design',
  'Non-slip surface',
  'Adjustable armrests',
  'Removable footrests',
  'Tool-free assembly'
];

// Common tags for medical equipment
const commonTags = [
  'hospital-grade',
  'FDA-approved',
  'certified',
  'durable',
  'portable',
  'adjustable',
  'emergency',
  'ICU',
  'rehabilitation',
  'geriatric',
  'pediatric',
  'bariatric',
  'infection-control',
  'mobility',
  'comfort',
  'safety',
  'professional',
  'home-care',
  'clinic',
  'urgent'
];

const ShopManager: React.FC = () => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<ShopProduct>>({
    name: '',
    description: '',
    price: 0,
    original_price: undefined,
    category: 'hospital-beds',
    brand: '',
    model: '',
    condition: 'refurbished',
    in_stock: true,
    stock_quantity: 1,
    specifications: {},
    features: [],
    warranty: '',
    tags: []
  });

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

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
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
    switch (condition) {
      case 'new':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'refurbished':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'used-excellent':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'used-good':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteShopProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const toggleStockStatus = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (product) {
        await updateStockStatus(productId, !product.in_stock, product.stock_quantity);
        setProducts(products.map(p => 
          p.id === productId 
            ? { ...p, in_stock: !p.in_stock }
            : p
        ));
      }
    } catch (error) {
      console.error('Failed to update stock status:', error);
    }
  };

  const getStockStatusColor = (in_stock: boolean) => {
    return in_stock 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hospital-beds':
        return <Bed className="w-5 h-5" />;
      case 'wheelchairs':
        return <Users className="w-5 h-5" />;
      case 'monitoring':
        return <Monitor className="w-5 h-5" />;
      case 'parts':
        return <Settings className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        name: newProduct.name!,
        description: newProduct.description!,
        price: newProduct.price!,
        original_price: newProduct.original_price,
        category: newProduct.category!,
        brand: newProduct.brand,
        model: newProduct.model,
        condition: newProduct.condition!,
        in_stock: newProduct.in_stock!,
        stock_quantity: newProduct.stock_quantity || 1,
        specifications: newProduct.specifications || {},
        features: newProduct.features || [],
        warranty: newProduct.warranty || '',
        tags: newProduct.tags || []
      };

      const createdProduct = await createShopProduct(productData, ['/src/assets/images/placeholder.jpg']);
      setProducts([...products, createdProduct]);
      setShowAddModal(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        original_price: undefined,
        category: 'hospital-beds',
        brand: '',
        model: '',
        condition: 'refurbished',
        in_stock: true,
        stock_quantity: 1,
        specifications: {},
        features: [],
        warranty: '',
        tags: []
      });
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleInputChange = (field: keyof ShopProduct, value: any) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSpecification = (key: string, value: string) => {
    if (key && value) {
      setNewProduct(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [key]: value
        }
      }));
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...newProduct.specifications };
    delete newSpecs[key];
    setNewProduct(prev => ({
      ...prev,
      specifications: newSpecs
    }));
  };

  const addFeature = (feature: string) => {
    if (feature && !newProduct.features?.includes(feature)) {
      setNewProduct(prev => ({
        ...prev,
        features: [...(prev.features || []), feature]
      }));
    }
  };

  const removeFeature = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !newProduct.tags?.includes(tag)) {
      setNewProduct(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const removeTag = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }));
  };

  const handleEditProduct = (product: ShopProduct) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const updatedProduct = await updateShopProductWithImages(editingProduct.id, editingProduct);
      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleEditInputChange = (field: keyof ShopProduct, value: any) => {
    if (!editingProduct) return;
    setEditingProduct(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const addEditSpecification = (key: string, value: string) => {
    if (key && value && editingProduct) {
      setEditingProduct(prev => ({
        ...prev!,
        specifications: {
          ...prev!.specifications,
          [key]: value
        }
      }));
    }
  };

  const removeEditSpecification = (key: string) => {
    if (!editingProduct) return;
    const newSpecs = { ...editingProduct.specifications };
    delete newSpecs[key];
    setEditingProduct(prev => ({
      ...prev!,
      specifications: newSpecs
    }));
  };

  const addEditFeature = (feature: string) => {
    if (feature && editingProduct && !editingProduct.features?.includes(feature)) {
      setEditingProduct(prev => ({
        ...prev!,
        features: [...(prev!.features || []), feature]
      }));
    }
  };

  const removeEditFeature = (index: number) => {
    if (!editingProduct) return;
    setEditingProduct(prev => ({
      ...prev!,
      features: prev!.features?.filter((_, i) => i !== index) || []
    }));
  };

  const addEditTag = (tag: string) => {
    if (tag && editingProduct && !editingProduct.tags?.includes(tag)) {
      setEditingProduct(prev => ({
        ...prev!,
        tags: [...(prev!.tags || []), tag]
      }));
    }
  };

  const removeEditTag = (index: number) => {
    if (!editingProduct) return;
    setEditingProduct(prev => ({
      ...prev!,
      tags: prev!.tags?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shop Management</h1>
          <p className="text-gray-600 mt-1">Manage your medical equipment inventory</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600">{products.filter(p => p.in_stock).length}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{products.filter(p => !p.in_stock).length}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(products.reduce((sum, p) => sum + (p.price * (p.stock_quantity || 1)), 0))}
              </p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {updatedCategories.map((category) => (
              <motion.button
                key={category.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.label}</span>
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {category.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/30 divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-white/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(product.category)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.brand} {product.model}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {product.category.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getConditionColor(product.condition)}`}>
                      {product.condition.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                    {product.original_price && (
                      <div className="text-xs text-gray-500 line-through">
                        {formatPrice(product.original_price)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stock_quantity || 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStockStatus(product.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${getStockStatusColor(product.in_stock)}`}
                    >
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(product.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getConditionColor(selectedProduct.condition)}`}>
                        {selectedProduct.condition.replace('-', ' ')}
                      </span>
                      {selectedProduct.brand && (
                        <span className="text-gray-600">{selectedProduct.brand} {selectedProduct.model}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-8xl text-green-600/20">
                        {getCategoryIcon(selectedProduct.category)}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {formatPrice(selectedProduct.price)}
                      </div>
                      {selectedProduct.original_price && (
                        <div className="text-lg text-gray-500 line-through mb-4">
                          {formatPrice(selectedProduct.original_price)}
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Stock:</span>
                        <span className="font-medium">{selectedProduct.stock_quantity || 1}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStockStatusColor(selectedProduct.in_stock)}`}>
                          {selectedProduct.in_stock ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                    </div>

                    {selectedProduct.specifications && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                              <span className="text-gray-600 font-medium">{key}:</span>
                              <span className="text-gray-900">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProduct.features && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Features</h3>
                        <ul className="space-y-2">
                          {selectedProduct.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

             {/* Add Product Modal */}
       <AnimatePresence>
         {showAddModal && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
             onClick={() => setShowAddModal(false)}
           >
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}
             >
               <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                   <div>
                     <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                     <p className="text-gray-600">Fill in the details for the new medical equipment</p>
                   </div>
                   <button
                     onClick={() => setShowAddModal(false)}
                     className="text-gray-400 hover:text-gray-600"
                   >
                     <X className="w-6 h-6" />
                   </button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Left Column - Basic Info */}
                   <div className="space-y-6">
                     <div>
                       <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                       
                       <div className="space-y-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Product Name *
                           </label>
                           <input
                             type="text"
                             value={newProduct.name}
                             onChange={(e) => handleInputChange('name', e.target.value)}
                             placeholder="e.g., Hill-Rom CareAssist ES Hospital Bed"
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Description *
                           </label>
                           <textarea
                             value={newProduct.description}
                             onChange={(e) => handleInputChange('description', e.target.value)}
                             placeholder="Detailed description of the medical equipment..."
                             rows={4}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                           />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Brand
                             </label>
                             <input
                               type="text"
                               value={newProduct.brand}
                               onChange={(e) => handleInputChange('brand', e.target.value)}
                               placeholder="e.g., Hill-Rom"
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             />
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Model
                             </label>
                             <input
                               type="text"
                               value={newProduct.model}
                               onChange={(e) => handleInputChange('model', e.target.value)}
                               placeholder="e.g., CareAssist ES"
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             />
                           </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Category *
                             </label>
                             <select
                               value={newProduct.category}
                               onChange={(e) => handleInputChange('category', e.target.value)}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             >
                               <option value="hospital-beds">Hospital Beds</option>
                               <option value="wheelchairs">Wheelchairs</option>
                               <option value="monitoring">Monitoring Equipment</option>
                               <option value="parts">Parts & Accessories</option>
                             </select>
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Condition *
                             </label>
                             <select
                               value={newProduct.condition}
                               onChange={(e) => handleInputChange('condition', e.target.value)}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             >
                               <option value="new">New</option>
                               <option value="refurbished">Refurbished</option>
                               <option value="used-excellent">Used - Excellent</option>
                               <option value="used-good">Used - Good</option>
                             </select>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Pricing & Stock */}
                     <div>
                       <h3 className="text-lg font-semibold mb-4">Pricing & Stock</h3>
                       
                       <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Price (₱) *
                             </label>
                             <input
                               type="number"
                               value={newProduct.price}
                               onChange={(e) => handleInputChange('price', Number(e.target.value))}
                               placeholder="0"
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             />
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Original Price (₱)
                             </label>
                             <input
                               type="number"
                               value={newProduct.original_price || ''}
                               onChange={(e) => handleInputChange('original_price', e.target.value ? Number(e.target.value) : undefined)}
                               placeholder="Optional"
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             />
                           </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Stock Quantity
                             </label>
                             <input
                               type="number"
                               value={newProduct.stock_quantity}
                               onChange={(e) => handleInputChange('stock_quantity', Number(e.target.value))}
                               min="0"
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             />
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Availability
                             </label>
                             <select
                               value={newProduct.in_stock ? 'true' : 'false'}
                               onChange={(e) => handleInputChange('in_stock', e.target.value === 'true')}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             >
                               <option value="true">In Stock</option>
                               <option value="false">Out of Stock</option>
                             </select>
                           </div>
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Warranty Information
                           </label>
                           <input
                             type="text"
                             value={newProduct.warranty}
                             onChange={(e) => handleInputChange('warranty', e.target.value)}
                             placeholder="e.g., 12 months parts & labor"
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                           />
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Right Column - Details */}
                   <div className="space-y-6">
                     {/* Specifications */}
                     <div>
                       <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                       
                       <div className="space-y-3">
                         {Object.entries(newProduct.specifications || {}).map(([key, value]) => (
                           <div key={key} className="flex gap-2">
                             <input
                               type="text"
                               value={key}
                               readOnly
                               className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                             />
                             <input
                               type="text"
                               value={value}
                               readOnly
                               className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                             />
                             <button
                               onClick={() => removeSpecification(key)}
                               className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                         ))}
                         
                         <div className="flex gap-2">
                           <input
                             type="text"
                             placeholder="Specification name"
                             className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm"
                             onKeyPress={(e) => {
                               if (e.key === 'Enter') {
                                 const key = e.currentTarget.value;
                                 const valueInput = e.currentTarget.nextElementSibling as HTMLInputElement;
                                 if (key && valueInput?.value) {
                                   addSpecification(key, valueInput.value);
                                   e.currentTarget.value = '';
                                   valueInput.value = '';
                                 }
                               }
                             }}
                           />
                           <input
                             type="text"
                             placeholder="Value"
                             className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm"
                             onKeyPress={(e) => {
                               if (e.key === 'Enter') {
                                 const value = e.currentTarget.value;
                                 const keyInput = e.currentTarget.previousElementSibling as HTMLInputElement;
                                 if (value && keyInput?.value) {
                                   addSpecification(keyInput.value, value);
                                   keyInput.value = '';
                                   e.currentTarget.value = '';
                                 }
                               }
                             }}
                           />
                           <button
                             onClick={() => {
                               const inputs = document.querySelectorAll('.specification-input') as NodeListOf<HTMLInputElement>;
                               const key = inputs[inputs.length - 2]?.value;
                               const value = inputs[inputs.length - 1]?.value;
                               if (key && value) {
                                 addSpecification(key, value);
                                 inputs[inputs.length - 2].value = '';
                                 inputs[inputs.length - 1].value = '';
                               }
                             }}
                             className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                           >
                             <Plus className="w-4 h-4" />
                           </button>
                         </div>
                       </div>
                     </div>

                     {/* Features */}
                     <div>
                       <h3 className="text-lg font-semibold mb-4">Features</h3>
                       
                       <div className="space-y-3">
                         {(newProduct.features || []).map((feature, index) => (
                           <div key={index} className="flex gap-2">
                             <input
                               type="text"
                               value={feature}
                               readOnly
                               className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                             />
                             <button
                               onClick={() => removeFeature(index)}
                               className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                         ))}
                         
                         <div className="flex gap-2">
                           <input
                             type="text"
                             placeholder="Add a feature..."
                             className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm feature-input"
                             onKeyPress={(e) => {
                               if (e.key === 'Enter') {
                                 const feature = e.currentTarget.value.trim();
                                 if (feature) {
                                   addFeature(feature);
                                   e.currentTarget.value = '';
                                 }
                               }
                             }}
                           />
                           <button
                             onClick={() => {
                               const input = document.querySelector('.feature-input') as HTMLInputElement;
                               const feature = input?.value.trim();
                               if (feature) {
                                 addFeature(feature);
                                 input.value = '';
                               }
                             }}
                             className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                           >
                             <Plus className="w-4 h-4" />
                           </button>
                         </div>

                         {/* Common Feature Keywords */}
                         <div className="mt-4">
                           <div className="text-xs text-gray-500 mb-2">Click to add common features:</div>
                           <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                             {commonFeatures
                               .filter(feature => !(newProduct.features || []).includes(feature))
                               .map((feature) => (
                               <button
                                 key={feature}
                                 onClick={() => addFeature(feature)}
                                 className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                               >
                                 {feature}
                               </button>
                             ))}
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Tags */}
                     <div>
                       <h3 className="text-lg font-semibold mb-4">Tags</h3>
                       
                       <div className="space-y-3">
                         <div className="flex flex-wrap gap-2">
                           {(newProduct.tags || []).map((tag, index) => (
                             <span
                               key={index}
                               className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                             >
                               {tag}
                               <button
                                 onClick={() => removeTag(index)}
                                 className="text-green-600 hover:text-green-800"
                               >
                                 <X className="w-3 h-3" />
                               </button>
                             </span>
                           ))}
                         </div>
                         
                         <div className="flex gap-2">
                           <input
                             type="text"
                             placeholder="Add a tag..."
                             className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm tag-input"
                             onKeyPress={(e) => {
                               if (e.key === 'Enter') {
                                 const tag = e.currentTarget.value.trim();
                                 if (tag) {
                                   addTag(tag);
                                   e.currentTarget.value = '';
                                 }
                               }
                             }}
                           />
                           <button
                             onClick={() => {
                               const input = document.querySelector('.tag-input') as HTMLInputElement;
                               const tag = input?.value.trim();
                               if (tag) {
                                 addTag(tag);
                                 input.value = '';
                               }
                             }}
                             className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                           >
                             <Plus className="w-4 h-4" />
                           </button>
                         </div>

                         {/* Common Tag Keywords */}
                         <div className="mt-4">
                           <div className="text-xs text-gray-500 mb-2">Click to add common tags:</div>
                           <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                             {commonTags
                               .filter(tag => !(newProduct.tags || []).includes(tag))
                               .map((tag) => (
                               <button
                                 key={tag}
                                 onClick={() => addTag(tag)}
                                 className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200 hover:bg-purple-100 transition-colors"
                               >
                                 {tag}
                               </button>
                             ))}
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Modal Actions */}
                 <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                   <button
                     onClick={() => setShowAddModal(false)}
                     className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={handleAddProduct}
                     className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                   >
                     Add Product
                   </button>
                 </div>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Edit Product Modal */}
       <AnimatePresence>
         {showEditModal && editingProduct && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
             onClick={() => setShowEditModal(false)}
           >
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}
             >
               <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                   <div>
                     <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                     <p className="text-gray-600">Update the details for this medical equipment</p>
                   </div>
                   <button
                     onClick={() => setShowEditModal(false)}
                     className="text-gray-400 hover:text-gray-600"
                   >
                     <X className="w-6 h-6" />
                   </button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Left Column - Basic Info */}
                   <div className="space-y-6">
                     <div>
                       <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                       
                       <div className="space-y-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Product Name *
                           </label>
                           <input
                             type="text"
                             value={editingProduct.name}
                             onChange={(e) => handleEditInputChange('name', e.target.value)}
                             placeholder="e.g., Hill-Rom CareAssist ES Hospital Bed"
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Description *
                           </label>
                           <textarea
                             value={editingProduct.description}
                             onChange={(e) => handleEditInputChange('description', e.target.value)}
                             placeholder="Detailed description of the medical equipment..."
                             rows={4}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                           />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Brand
                             </label>
                             <input
                               type="text"
                               value={editingProduct.brand || ''}
                               onChange={(e) => handleEditInputChange('brand', e.target.value)}
                               placeholder="e.g., Hill-Rom"
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             />
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Model
                             </label>
                             <input
                               type="text"
                               value={editingProduct.model || ''}
                               onChange={(e) => handleEditInputChange('model', e.target.value)}
                               placeholder="e.g., CareAssist ES"
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             />
                           </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Category *
                             </label>
                             <select
                               value={editingProduct.category}
                               onChange={(e) => handleEditInputChange('category', e.target.value)}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             >
                               <option value="hospital-beds">Hospital Beds</option>
                               <option value="wheelchairs">Wheelchairs</option>
                               <option value="monitoring">Monitoring Equipment</option>
                               <option value="parts">Parts & Accessories</option>
                             </select>
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Condition *
                             </label>
                             <select
                               value={editingProduct.condition}
                               onChange={(e) => handleEditInputChange('condition', e.target.value)}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             >
                               <option value="new">New</option>
                               <option value="refurbished">Refurbished</option>
                               <option value="used-excellent">Used - Excellent</option>
                               <option value="used-good">Used - Good</option>
                             </select>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Pricing & Stock */}
                     <div>
                       <h3 className="text-lg font-semibold mb-4">Pricing & Stock</h3>
                       
                       <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Price (₱) *
                             </label>
                             <input
                               type="number"
                               value={editingProduct.price}
                               onChange={(e) => handleEditInputChange('price', Number(e.target.value))}
                               placeholder="0"
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             />
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Original Price (₱)
                             </label>
                             <input
                               type="number"
                               value={editingProduct.original_price || ''}
                               onChange={(e) => handleEditInputChange('original_price', e.target.value ? Number(e.target.value) : undefined)}
                               placeholder="Optional"
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             />
                           </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Stock Quantity
                             </label>
                             <input
                               type="number"
                               value={editingProduct.stock_quantity || 1}
                               onChange={(e) => handleEditInputChange('stock_quantity', Number(e.target.value))}
                               min="0"
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             />
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Availability
                             </label>
                             <select
                               value={editingProduct.in_stock ? 'true' : 'false'}
                               onChange={(e) => handleEditInputChange('in_stock', e.target.value === 'true')}
                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                             >
                               <option value="true">In Stock</option>
                               <option value="false">Out of Stock</option>
                             </select>
                           </div>
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Warranty Information
                           </label>
                           <input
                             type="text"
                             value={editingProduct.warranty || ''}
                             onChange={(e) => handleEditInputChange('warranty', e.target.value)}
                             placeholder="e.g., 12 months parts & labor"
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                           />
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Right Column - Details */}
                   <div className="space-y-6">
                     {/* Specifications */}
                     <div>
                       <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                       
                       <div className="space-y-3">
                         {Object.entries(editingProduct.specifications || {}).map(([key, value]) => (
                           <div key={key} className="flex gap-2">
                             <input
                               type="text"
                               value={key}
                               readOnly
                               className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                             />
                             <input
                               type="text"
                               value={value}
                               readOnly
                               className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                             />
                             <button
                               onClick={() => removeEditSpecification(key)}
                               className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                         ))}
                         
                         <div className="flex gap-2">
                           <input
                             type="text"
                             placeholder="Specification name"
                             className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm edit-spec-key"
                           />
                           <input
                             type="text"
                             placeholder="Value"
                             className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm edit-spec-value"
                           />
                           <button
                             onClick={() => {
                               const keyInput = document.querySelector('.edit-spec-key') as HTMLInputElement;
                               const valueInput = document.querySelector('.edit-spec-value') as HTMLInputElement;
                               const key = keyInput?.value.trim();
                               const value = valueInput?.value.trim();
                               if (key && value) {
                                 addEditSpecification(key, value);
                                 keyInput.value = '';
                                 valueInput.value = '';
                               }
                             }}
                             className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                           >
                             <Plus className="w-4 h-4" />
                           </button>
                         </div>
                       </div>
                     </div>

                                           {/* Features */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Features</h3>
                        
                        <div className="space-y-3">
                          {(editingProduct.features || []).map((feature, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={feature}
                                readOnly
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                              />
                              <button
                                onClick={() => removeEditFeature(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a feature..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm edit-feature-input"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const feature = e.currentTarget.value.trim();
                                  if (feature) {
                                    addEditFeature(feature);
                                    e.currentTarget.value = '';
                                  }
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                const input = document.querySelector('.edit-feature-input') as HTMLInputElement;
                                const feature = input?.value.trim();
                                if (feature) {
                                  addEditFeature(feature);
                                  input.value = '';
                                }
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Common Feature Keywords */}
                          <div className="mt-4">
                            <div className="text-xs text-gray-500 mb-2">Click to add common features:</div>
                            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                              {commonFeatures
                                .filter(feature => !(editingProduct.features || []).includes(feature))
                                .map((feature) => (
                                <button
                                  key={feature}
                                  onClick={() => addEditFeature(feature)}
                                  className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                                >
                                  {feature}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                                           {/* Tags */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Tags</h3>
                        
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {(editingProduct.tags || []).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                              >
                                {tag}
                                <button
                                  onClick={() => removeEditTag(index)}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a tag..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm edit-tag-input"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const tag = e.currentTarget.value.trim();
                                  if (tag) {
                                    addEditTag(tag);
                                    e.currentTarget.value = '';
                                  }
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                const input = document.querySelector('.edit-tag-input') as HTMLInputElement;
                                const tag = input?.value.trim();
                                if (tag) {
                                  addEditTag(tag);
                                  input.value = '';
                                }
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Common Tag Keywords */}
                          <div className="mt-4">
                            <div className="text-xs text-gray-500 mb-2">Click to add common tags:</div>
                            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                              {commonTags
                                .filter(tag => !(editingProduct.tags || []).includes(tag))
                                .map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() => addEditTag(tag)}
                                  className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200 hover:bg-purple-100 transition-colors"
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                   </div>
                 </div>

                 {/* Modal Actions */}
                 <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                   <button
                     onClick={() => setShowEditModal(false)}
                     className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={handleUpdateProduct}
                     className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                   >
                     Update Product
                   </button>
                 </div>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Delete Confirmation Modal */}
       <AnimatePresence>
         {showDeleteModal && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
             onClick={() => setShowDeleteModal(null)}
           >
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-2xl max-w-md w-full p-6"
               onClick={(e) => e.stopPropagation()}
             >
               <div className="flex items-center gap-4 mb-4">
                 <div className="p-2 bg-red-100 rounded-lg">
                   <AlertTriangle className="w-6 h-6 text-red-600" />
                 </div>
                 <div>
                   <h3 className="text-lg font-semibold text-gray-900">Remove Product</h3>
                   <p className="text-gray-600">This product will be removed from the shop.</p>
                 </div>
               </div>
               
               <div className="flex gap-3">
                 <button
                   onClick={() => setShowDeleteModal(null)}
                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={() => handleDeleteProduct(showDeleteModal)}
                   className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                 >
                   Remove
                 </button>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

export default ShopManager; 