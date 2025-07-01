import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CompletedServices from '../components/CompletedServices'
import GalleryManager from '../components/GalleryManager'
import ShopManager from '../components/ShopManager'
import { getServiceStatistics } from '../lib/completedServicesApi'
import { getGalleryStatistics } from '../lib/galleryApi'
import { getShopStatistics } from '../lib/shopApi'
import {
  ChartBarIcon,
  TruckIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BeakerIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  WrenchIcon,
  PlusIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import vpmedLogo from '../assets/images/vpmed.jpg'

const Dashboard: React.FC = () => {
  const { user, loading, signOut, isAuthenticated, session } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('analytics')
  const [analyticsData, setAnalyticsData] = useState({
    services: { totalServices: 0, totalRevenue: 0, pendingPayments: 0, paidServices: 0 },
    gallery: { totalItems: 0, featuredItems: 0, averageRating: 0, categoryCounts: {} },
    shop: { totalProducts: 0, inStockProducts: 0, outOfStockProducts: 0, totalValue: 0 }
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setAnalyticsLoading(true);
        const [servicesStats, galleryStats, shopStats] = await Promise.all([
          getServiceStatistics(),
          getGalleryStatistics(), 
          getShopStatistics()
        ]);

        setAnalyticsData({
          services: servicesStats,
          gallery: galleryStats,
          shop: shopStats
        });
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [isAuthenticated, user]);

  // Check authentication status and handle redirects
  useEffect(() => {
    console.log('Dashboard - Auth status:', {
      user: user?.email,
      isAuthenticated,
      loading,
      sessionExists: !!session
    })
  }, [user, isAuthenticated, loading, session])

  // Redirect if not authenticated
  if (!loading && !isAuthenticated && !user) {
    console.log('Dashboard - Redirecting to login: not authenticated')
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-12 w-12 border-3 border-transparent border-t-emerald-400 animate-spin animation-delay-150"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
          {user?.email && (
            <p className="mt-2 text-sm text-gray-500">Welcome back, {user.email.split('@')[0]}!</p>
          )}
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      console.log('Dashboard - Signing out user')
    await signOut()
      console.log('Dashboard - Sign out completed')
    } catch (error) {
      console.error('Dashboard - Sign out error:', error)
    }
  }

  const refreshAnalytics = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setAnalyticsLoading(true);
      const [servicesStats, galleryStats, shopStats] = await Promise.all([
        getServiceStatistics(),
        getGalleryStatistics(), 
        getShopStatistics()
      ]);

      setAnalyticsData({
        services: servicesStats,
        gallery: galleryStats,
        shop: shopStats
      });
    } catch (error) {
      console.error('Failed to refresh analytics data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (view === 'analytics') {
      refreshAnalytics();
    }
  };

  const sidebarItems = [
    { name: 'Analytics Dashboard', icon: ChartBarIcon, href: '#', current: currentView === 'analytics', view: 'analytics' },
    { name: 'Completed Services', icon: WrenchIcon, href: '#', current: currentView === 'services', view: 'services' },
    { name: 'Gallery Manager', icon: PhotoIcon, href: '#', current: currentView === 'gallery', view: 'gallery' },
    { name: 'Shop Management', icon: TruckIcon, href: '#', current: currentView === 'shop', view: 'shop' },
  ]

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const stats = analyticsLoading ? [
    { 
      name: 'Total Services', 
      value: 'Loading...', 
      change: '', 
      changeType: 'positive',
      icon: WrenchIcon,
      color: 'emerald',
      description: 'Completed services'
    },
    { 
      name: 'Total Revenue', 
      value: 'Loading...', 
      change: '', 
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'emerald',
      description: 'Service earnings'
    },
    { 
      name: 'Shop Products', 
      value: 'Loading...', 
      change: '', 
      changeType: 'positive',
      icon: TruckIcon,
      color: 'emerald',
      description: 'Available products'
    },
    { 
      name: 'Gallery Items', 
      value: 'Loading...', 
      change: '', 
      changeType: 'positive',
      icon: PhotoIcon,
      color: 'emerald',
      description: 'Portfolio items'
    },
  ] : [
    { 
      name: 'Total Services', 
      value: analyticsData.services.totalServices.toString(), 
      change: `${analyticsData.services.paidServices} paid`, 
      changeType: 'positive' as const,
      icon: WrenchIcon,
      color: 'emerald',
      description: 'Completed services'
    },
    { 
      name: 'Total Revenue', 
      value: formatCurrency(analyticsData.services.totalRevenue), 
      change: `₱${analyticsData.services.pendingPayments.toLocaleString()} pending`, 
      changeType: 'positive' as const,
      icon: CurrencyDollarIcon,
      color: 'emerald',
      description: 'Service earnings'
    },
    { 
      name: 'Shop Products', 
      value: analyticsData.shop.totalProducts.toString(), 
      change: `${analyticsData.shop.inStockProducts} in stock`, 
      changeType: 'positive' as const,
      icon: TruckIcon,
      color: 'emerald',
      description: 'Available products'
    },
    { 
      name: 'Gallery Items', 
      value: analyticsData.gallery.totalItems.toString(), 
      change: `${analyticsData.gallery.featuredItems} featured`, 
      changeType: 'positive' as const,
      icon: PhotoIcon,
      color: 'emerald',
      description: 'Portfolio items'
    },
  ]

  const StatIcon = ({ icon: Icon, color }: { icon: any, color: string }) => (
    <div className={`p-3 rounded-xl ${color === 'emerald' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200' : 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200'} shadow-sm`}>
      <Icon className={`h-6 w-6 ${color === 'emerald' ? 'text-emerald-600' : 'text-red-600'}`} />
    </div>
  )

  // Get user display info
  const userDisplayName = user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || 'Unknown'

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Mobile sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 flex z-40 lg:hidden`}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <motion.div 
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative flex-1 flex flex-col max-w-xs w-full bg-white/95 backdrop-blur-xl border-r border-gray-200 shadow-2xl"
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50 hover:bg-white/20 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4 mb-6">
              <img
                src={vpmedLogo}
                alt="VPMED Logo" 
                className="h-10 w-10 rounded-xl shadow-lg object-cover"
              />
              <div className="ml-3">
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">VPMED</h1>
                <p className="text-xs text-gray-600 font-medium">Medical Excellence</p>
              </div>
            </div>
            <nav className="px-3 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleViewChange(item.view)}
                  className={`${
                    item.current
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                      : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                  } group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 w-full text-left backdrop-blur-sm`}
                >
                  <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white/90 backdrop-blur-xl border-r border-gray-200 shadow-xl">
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6 mb-6">
                <img
                  src={vpmedLogo}
                  alt="VPMED Logo" 
                  className="h-10 w-10 rounded-xl shadow-lg object-cover"
                />
                <div className="ml-3">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">VPMED</h1>
                  <p className="text-xs text-gray-600 font-medium">Medical Excellence Platform</p>
                </div>
              </div>
              <nav className="flex-1 px-4 space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleViewChange(item.view)}
                    className={`${
                      item.current
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                        : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                    } group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 w-full text-left backdrop-blur-sm`}
                  >
                    <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <button
            className="px-4 border-r border-white/20 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 lg:hidden hover:bg-white/40 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-end items-center">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img 
                  src={vpmedLogo} 
                  alt="VPMED Logo" 
                  className="h-8 w-8 rounded-xl shadow-lg object-cover"
                />
                </div>
                <div className="hidden lg:block">
                <div className="text-sm font-semibold text-gray-900">{userDisplayName}</div>
                <div className="text-xs text-gray-600 font-medium">Medical Administrator</div>
                </div>
                <button
                  onClick={handleSignOut}
                className="bg-white/80 backdrop-blur-sm p-2 rounded-xl text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 border border-gray-200 hover:bg-white transition-all shadow-sm"
                title="Sign Out"
                >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                </button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {currentView === 'services' ? (
                <CompletedServices />
              ) : currentView === 'gallery' ? (
                <GalleryManager />
              ) : currentView === 'shop' ? (
                <ShopManager />
              ) : (
                <>
              {/* Welcome section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">
                          Welcome back, {userDisplayName}!
                </h1>
                        <p className="text-base text-gray-600 font-medium">
                          Your comprehensive medical facility overview for today
                        </p>
                        {session && (
                          <p className="text-sm text-gray-500 mt-1">
                            Logged in as: {userEmail}
                          </p>
                        )}
                      </div>
                      <div className="hidden lg:block">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-500">Today</p>
                          <p className="text-base font-semibold text-gray-900">{new Date().toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</p>
                        </div>
                      </div>
                    </div>
              </motion.div>

              {/* Stats grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                          className="bg-white backdrop-blur-xl overflow-hidden border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 hover:-translate-y-1 group"
                    >
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                            <StatIcon icon={stat.icon} color={stat.color} />
                              <div
                                className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                                  stat.changeType === 'positive' 
                                    ? 'text-emerald-700 bg-emerald-100 border border-emerald-200' 
                                    : 'text-red-700 bg-red-100 border border-red-200'
                                }`}
                              >
                                <span className={`inline-block w-0 h-0 border-l-2 border-r-2 border-transparent mr-1 ${
                                  stat.changeType === 'positive' 
                                    ? 'border-b-2 border-b-emerald-600' 
                                    : 'border-t-2 border-t-red-600'
                                }`}></span>
                                {stat.change}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-600 mb-1">{stat.name}</div>
                              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                              <div className="text-xs text-gray-500 font-medium">{stat.description}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Analytics Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Business Analytics Overview</h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      {/* Services Analytics */}
                      <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <WrenchIcon className="h-5 w-5 text-emerald-500 mr-2" />
                            Services Performance
                          </h3>
                        </div>
                        <div className="p-5">
                          {analyticsLoading ? (
                            <div className="animate-pulse space-y-3">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Total Services</span>
                                <span className="text-lg font-bold text-gray-900">{analyticsData.services.totalServices}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Paid Services</span>
                                <span className="text-lg font-bold text-green-600">{analyticsData.services.paidServices}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Pending Payments</span>
                                <span className="text-lg font-bold text-orange-600">{formatCurrency(analyticsData.services.pendingPayments)}</span>
                              </div>
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-emerald-600">{formatCurrency(analyticsData.services.totalRevenue)}</div>
                                  <div className="text-sm text-gray-500">Total Revenue</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shop Analytics */}
                      <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <TruckIcon className="h-5 w-5 text-blue-500 mr-2" />
                            Shop Inventory
                          </h3>
                        </div>
                        <div className="p-5">
                          {analyticsLoading ? (
                            <div className="animate-pulse space-y-3">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Total Products</span>
                                <span className="text-lg font-bold text-gray-900">{analyticsData.shop.totalProducts}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">In Stock</span>
                                <span className="text-lg font-bold text-green-600">{analyticsData.shop.inStockProducts}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Out of Stock</span>
                                <span className="text-lg font-bold text-red-600">{analyticsData.shop.outOfStockProducts}</span>
                              </div>
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(analyticsData.shop.totalValue)}</div>
                                  <div className="text-sm text-gray-500">Inventory Value</div>
                                </div>
                              </div>
                          </div>
                          )}
                        </div>
                      </div>

                      {/* Gallery Analytics */}
                      <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <PhotoIcon className="h-5 w-5 text-purple-500 mr-2" />
                            Gallery Portfolio
                          </h3>
                        </div>
                        <div className="p-5">
                          {analyticsLoading ? (
                            <div className="animate-pulse space-y-3">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Total Items</span>
                                <span className="text-lg font-bold text-gray-900">{analyticsData.gallery.totalItems}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Featured Items</span>
                                <span className="text-lg font-bold text-purple-600">{analyticsData.gallery.featuredItems}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Average Rating</span>
                                <span className="text-lg font-bold text-yellow-600">{analyticsData.gallery.averageRating.toFixed(1)}★</span>
                              </div>
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="text-center">
                                  <div className="text-sm text-gray-600 mb-2">Category Distribution</div>
                                  <div className="text-xs space-y-1">
                                    {Object.entries(analyticsData.gallery.categoryCounts).map(([category, count]) => (
                                      <div key={category} className="flex justify-between">
                                        <span className="capitalize">{category.replace('-', ' ')}</span>
                                        <span className="font-semibold">{count as number}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                </div>
              </motion.div>

              {/* Content grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-3"
              >
                {/* Real-time Alerts */}
                <div className="lg:col-span-1">
                      <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                        Critical Alerts
                      </h3>
                    </div>
                        <div className="p-5">
                      <div className="space-y-4">
                        {[
                          { type: 'Equipment', message: 'Ventilator #V-204 requires maintenance', time: '2 min ago', severity: 'high' },
                          { type: 'Inventory', message: 'Low stock: Surgical masks (12 units left)', time: '15 min ago', severity: 'medium' },
                          { type: 'Compliance', message: 'Device calibration due: Blood pressure monitors', time: '1 hour ago', severity: 'medium' },
                          { type: 'Safety', message: 'Temperature sensor anomaly in Storage Room B', time: '2 hours ago', severity: 'high' },
                        ].map((alert, index) => (
                              <div key={index} className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-gray-200 transition-all duration-200">
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                  alert.severity === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            }`}></div>
                            <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-gray-900">{alert.type}</p>
                                  <p className="text-sm text-gray-700 font-medium leading-relaxed">{alert.message}</p>
                                  <p className="text-xs text-gray-500 mt-1 font-medium">{alert.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment Status */}
                <div className="lg:col-span-1">
                      <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-emerald-500 mr-2" />
                        Equipment Status
                      </h3>
                    </div>
                        <div className="p-5">
                      <div className="space-y-4">
                        {[
                          { name: 'MRI Machines', total: 8, operational: 7, maintenance: 1, status: 'good' },
                          { name: 'Ventilators', total: 24, operational: 22, maintenance: 2, status: 'good' },
                          { name: 'X-Ray Units', total: 12, operational: 10, maintenance: 2, status: 'warning' },
                          { name: 'Dialysis Machines', total: 16, operational: 15, maintenance: 1, status: 'good' },
                        ].map((equipment, index) => (
                              <div key={index} className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-all duration-200">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900 text-sm">{equipment.name}</h4>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                                equipment.status === 'good' 
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              }`}>
                                {equipment.operational}/{equipment.total} Online
                              </span>
                            </div>
                            <div className="mt-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                                <div 
                                      className={`h-2 rounded-full transition-all duration-500 ${
                                        equipment.status === 'good' 
                                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                                          : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                  }`}
                                  style={{width: `${(equipment.operational / equipment.total) * 100}%`}}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-1">
                      <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300">
                        <div className="px-5 py-4 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                    </div>
                        <div className="p-5">
                          <div className="grid grid-cols-1 gap-3">
                        {[
                          { name: 'View Inventory', icon: BeakerIcon, href: '/dashboard/inventory', color: 'emerald' },
                          { name: 'Equipment Reports', icon: ClipboardDocumentCheckIcon, href: '/dashboard/reports', color: 'blue' },
                          { name: 'Safety Compliance', icon: ShieldCheckIcon, href: '/dashboard/compliance', color: 'green' },
                          { name: 'Patient Data', icon: HeartIcon, href: '/dashboard/patients', color: 'red' },
                        ].map((action) => (
                          <a
                            key={action.name}
                            href={action.href}
                                className="relative group bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 p-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-500 rounded-xl transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-lg"
                          >
                            <div className="flex items-center space-x-3">
                                  <span className={`rounded-xl inline-flex p-3 ring-4 ring-white/50 shadow-lg ${
                                    action.color === 'emerald' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200' :
                                    action.color === 'blue' ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border border-blue-200' :
                                    action.color === 'green' ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-700 border border-green-200' :
                                    'bg-gradient-to-br from-red-50 to-red-100 text-red-700 border border-red-200'
                              }`}>
                                    <action.icon className="h-5 w-5" />
                              </span>
                              <div>
                                    <h3 className="text-sm font-semibold text-gray-900">{action.name}</h3>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity Feed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8"
              >
                    <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
                      Recent Activity
                    </h3>
                  </div>
                      <div className="p-5">
                    <div className="flow-root">
                          <ul className="-my-4 divide-y divide-gray-100">
                        {[
                          {
                            event: 'Equipment maintenance completed',
                            details: 'MRI Machine #M-105 service completed successfully',
                            time: '10 minutes ago',
                            type: 'maintenance',
                            user: 'Tech Team Alpha'
                          },
                          {
                            event: 'Inventory restocked',
                            details: 'Surgical supplies: 500 units of sterile gloves received',
                            time: '1 hour ago',
                            type: 'inventory',
                            user: 'Supply Manager'
                          },
                          {
                            event: 'Compliance check passed',
                            details: 'All dialysis machines passed monthly safety inspection',
                            time: '2 hours ago',
                            type: 'compliance',
                            user: 'Safety Inspector'
                          },
                          {
                            event: 'New equipment installed',
                            details: 'Digital X-Ray unit #DX-309 installation completed',
                            time: '4 hours ago',
                            type: 'installation',
                            user: 'Installation Team'
                          },
                        ].map((activity, index) => (
                          <li key={index} className="py-4">
                            <div className="flex items-start space-x-4">
                              <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                                    activity.type === 'maintenance' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                    activity.type === 'inventory' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                                    activity.type === 'compliance' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                    'bg-gradient-to-r from-purple-500 to-purple-600'
                              }`}></div>
                              <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-gray-900">{activity.event}</div>
                                    <div className="text-sm text-gray-700 font-medium leading-relaxed">{activity.details}</div>
                                    <div className="text-xs text-gray-500 mt-1 font-medium">
                                  {activity.time} • by {activity.user}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard 