import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  WrenchIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import type { CompletedService } from '../types'
import {
  fetchCompletedServices,
  createCompletedService,
  updateCompletedServiceWithParts,
  updatePaymentStatus,
  deleteCompletedService,
  getServiceStatistics,
  type CreateServiceData
} from '../lib/completedServicesApi'

const CompletedServices: React.FC = () => {
  const [services, setServices] = useState<CompletedService[]>([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({
    totalServices: 0,
    totalRevenue: 0,
    paidServices: 0,
    pendingPayments: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedService, setSelectedService] = useState<CompletedService | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingService, setEditingService] = useState<CompletedService | null>(null)
  const [deletingService, setDeletingService] = useState<CompletedService | null>(null)

  // Form state for new service
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    equipment_type: '',
    client_name: '',
    location: '',
    service_date: '',
    completion_date: '',
    duration: 0,
    service_fee: 0,
    technician: '',
    parts_used: [{ name: '', quantity: 1, cost: 0 }],
    labor_cost: 0,
    notes: ''
  })

  // Load services and statistics on component mount
  useEffect(() => {
    loadServicesAndStats()
  }, [])

  const loadServicesAndStats = async () => {
    try {
      setLoading(true)
      const [servicesData, statsData] = await Promise.all([
        fetchCompletedServices(),
        getServiceStatistics()
      ])
      setServices(servicesData)
      setStatistics(statsData)
    } catch (error) {
      console.error('Error loading services:', error)
      // You might want to show a toast notification here
    } finally {
      setLoading(false)
    }
  }

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.equipment_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus
    const matchesPayment = filterPayment === 'all' || service.payment_status === filterPayment
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const handleAddService = async () => {
    try {
      setLoading(true)
      const serviceData: CreateServiceData = {
        ...formData,
        parts_used: formData.parts_used.filter(part => part.name.trim() !== '')
      }
      
      await createCompletedService(serviceData)
      await loadServicesAndStats() // Refresh data
      setShowAddModal(false)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        equipment_type: '',
        client_name: '',
        location: '',
        service_date: '',
        completion_date: '',
        duration: 0,
        service_fee: 0,
        technician: '',
        parts_used: [{ name: '', quantity: 1, cost: 0 }],
        labor_cost: 0,
        notes: ''
      })
    } catch (error) {
      console.error('Error adding service:', error)
      // You might want to show a toast notification here
    } finally {
      setLoading(false)
    }
  }

  const addPartField = () => {
    setFormData({
      ...formData,
      parts_used: [...formData.parts_used, { name: '', quantity: 1, cost: 0 }]
    })
  }

  const removePartField = (index: number) => {
    const newParts = formData.parts_used.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      parts_used: newParts
    })
  }

  const updatePartField = (index: number, field: string, value: any) => {
    const newParts = [...formData.parts_used]
    newParts[index] = { ...newParts[index], [field]: value }
    setFormData({
      ...formData,
      parts_used: newParts
    })
  }

  const handleUpdatePaymentStatus = async (serviceId: string, newStatus: 'paid' | 'pending' | 'overdue') => {
    try {
      await updatePaymentStatus(serviceId, newStatus)
      await loadServicesAndStats() // Refresh data
    } catch (error) {
      console.error('Error updating payment status:', error)
    }
  }

  const handleEditService = (service: CompletedService) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description,
      equipment_type: service.equipment_type,
      client_name: service.client_name,
      location: service.location,
      service_date: service.service_date,
      completion_date: service.completion_date,
      duration: service.duration,
      service_fee: service.service_fee,
      technician: service.technician,
      parts_used: service.parts_used || [{ name: '', quantity: 1, cost: 0 }],
      labor_cost: service.labor_cost,
      notes: service.notes || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateService = async () => {
    if (!editingService) return

    try {
      setLoading(true)
      const serviceData: CreateServiceData = {
        ...formData,
        parts_used: formData.parts_used.filter(part => part.name.trim() !== '')
      }
      
      await updateCompletedServiceWithParts(editingService.id, serviceData)
      await loadServicesAndStats() // Refresh data
      setShowEditModal(false)
      setEditingService(null)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        equipment_type: '',
        client_name: '',
        location: '',
        service_date: '',
        completion_date: '',
        duration: 0,
        service_fee: 0,
        technician: '',
        parts_used: [{ name: '', quantity: 1, cost: 0 }],
        labor_cost: 0,
        notes: ''
      })
    } catch (error) {
      console.error('Error updating service:', error)
      // You might want to show a toast notification here
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteService = async () => {
    if (!deletingService) return

    try {
      setLoading(true)
      await deleteCompletedService(deletingService.id)
      await loadServicesAndStats() // Refresh data
      setShowDeleteModal(false)
      setDeletingService(null)
    } catch (error) {
      console.error('Error deleting service:', error)
      // You might want to show a toast notification here
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (service: CompletedService) => {
    setDeletingService(service)
    setShowDeleteModal(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
      case 'paid': return <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
      default: return <ClockIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
      case 'pending': return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200'
      case 'overdue': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200'
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 font-medium">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">
              Completed Services
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              Track and manage all completed medical equipment services and payments
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 sm:px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="sm:inline">Add New Service</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8"
      >
        <div className="bg-white backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 shadow-sm">
              <WrenchIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Total Services</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{statistics.totalServices}</p>
              <p className="text-xs text-gray-500 font-medium">Completed this month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-sm">
              <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                ₱{statistics.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 font-medium">Gross revenue</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
              <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Paid Services</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {statistics.paidServices}
              </p>
              <p className="text-xs text-gray-500 font-medium">Payment received</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-sm">
              <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Pending Payment</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {statistics.pendingPayments}
              </p>
              <p className="text-xs text-gray-500 font-medium">Awaiting payment</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-lg mb-6"
      >
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="w-full">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 font-medium transition-all text-sm shadow-sm"
              />
            </div>
          </div>
          
          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 sm:px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-900 text-sm w-full shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
            </select>
            
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="px-3 sm:px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-900 text-sm w-full shadow-sm"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Services List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-4 sm:p-5"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Services</h3>
        <div className="space-y-3">
          {filteredServices.map((service) => (
            <motion.div 
              key={service.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white backdrop-blur-sm border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group shadow-sm"
            >
              <div className="space-y-3">
                {/* Header with title and payment status */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{service.title}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full self-start ${getPaymentStatusColor(service.payment_status)}`}>
                        {service.payment_status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium">{service.equipment_type} - {service.client_name}</p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedService(service)
                        setShowDetailsModal(true)
                      }}
                      className="p-1.5 sm:p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all duration-200 border border-emerald-200 hover:border-emerald-300"
                      title="View Details"
                    >
                      <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => handleEditService(service)}
                      className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-blue-200 hover:border-blue-300"
                      title="Edit Service"
                    >
                      <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(service)}
                      className="p-1.5 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300"
                      title="Delete Service"
                    >
                      <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Service details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-gray-500 font-medium block">Duration:</span>
                    <span className="text-gray-900 font-semibold">{service.duration}h</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 font-medium block">Total:</span>
                    <span className="text-gray-900 font-semibold">₱{service.total_cost.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 font-medium block">Technician:</span>
                    <span className="text-gray-900 font-semibold truncate">{service.technician}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 font-medium block">Date:</span>
                    <span className="text-gray-900 font-semibold">{new Date(service.service_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredServices.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 inline-block mb-4">
              <WrenchIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="mt-3 text-sm sm:text-base font-semibold text-gray-900">No services found</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 font-medium px-4">Get started by creating a new service record.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 sm:px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold text-sm"
            >
              Add First Service
            </button>
          </div>
        )}
      </motion.div>

      {/* Add Service Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl mx-4"
            >
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200/60 flex items-center justify-between backdrop-blur-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add Completed Service</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="e.g., Hospital Bed Hydraulic Repair"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Equipment Type</label>
                      <input
                        type="text"
                        value={formData.equipment_type}
                        onChange={(e) => setFormData({...formData, equipment_type: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="e.g., Hospital Bed, IV Stand"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="Detailed description of the service performed..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Client Name</label>
                      <input
                        type="text"
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="e.g., St. Mary's Medical Center"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="e.g., Room 204, ICU Wing"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Technician</label>
                      <input
                        type="text"
                        value={formData.technician}
                        onChange={(e) => setFormData({...formData, technician: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="e.g., John Smith"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration (hours)</label>
                        <input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Fee (₱)</label>
                        <input
                          type="number"
                          value={formData.service_fee}
                          onChange={(e) => setFormData({...formData, service_fee: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Date</label>
                        <input
                          type="date"
                          value={formData.service_date}
                          onChange={(e) => setFormData({...formData, service_date: e.target.value})}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Completion Date</label>
                        <input
                          type="date"
                          value={formData.completion_date}
                          onChange={(e) => setFormData({...formData, completion_date: e.target.value})}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Labor Cost (₱)</label>
                      <input
                        type="number"
                        value={formData.labor_cost}
                        onChange={(e) => setFormData({...formData, labor_cost: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Parts Used Section */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">Parts/Materials Used</h3>
                    <button
                      onClick={addPartField}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all border border-emerald-200 hover:border-emerald-300"
                    >
                      + Add Part
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.parts_used.map((part: any, index: number) => (
                      <div key={index} className="grid grid-cols-4 gap-3 items-end bg-gray-50/80 p-3 rounded-xl border border-gray-200">
                        <div className="col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Part/Material Name</label>
                          <input
                            type="text"
                            value={part.name}
                            onChange={(e) => updatePartField(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                            placeholder="e.g., Hydraulic Pump, Caster Wheels"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Qty</label>
                          <input
                            type="number"
                            value={part.quantity}
                            onChange={(e) => updatePartField(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                            min="1"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cost (₱)</label>
                            <input
                              type="number"
                              value={part.cost}
                              onChange={(e) => updatePartField(index, 'cost', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                            />
                          </div>
                          {formData.parts_used.length > 1 && (
                            <button
                              onClick={() => removePartField(index)}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-all border border-red-200 hover:border-red-300"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                    placeholder="Any additional notes about the service..."
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white/80 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-semibold text-sm order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddService}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold shadow-lg text-sm order-1 sm:order-2"
                  >
                    Add Service
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Service Modal */}
      <AnimatePresence>
        {showEditModal && editingService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl mx-4"
            >
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200/60 flex items-center justify-between backdrop-blur-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Service</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingService(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="e.g., Hospital Bed Hydraulic Repair"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Equipment Type</label>
                      <input
                        type="text"
                        value={formData.equipment_type}
                        onChange={(e) => setFormData({...formData, equipment_type: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="e.g., Hospital Bed, IV Stand"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="Detailed description of the service performed..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Client Name</label>
                      <input
                        type="text"
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="e.g., St. Mary's Medical Center"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="e.g., Room 204, ICU Wing"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Technician</label>
                      <input
                        type="text"
                        value={formData.technician}
                        onChange={(e) => setFormData({...formData, technician: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="e.g., John Smith"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration (hours)</label>
                        <input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Fee (₱)</label>
                        <input
                          type="number"
                          value={formData.service_fee}
                          onChange={(e) => setFormData({...formData, service_fee: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Date</label>
                        <input
                          type="date"
                          value={formData.service_date}
                          onChange={(e) => setFormData({...formData, service_date: e.target.value})}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Completion Date</label>
                        <input
                          type="date"
                          value={formData.completion_date}
                          onChange={(e) => setFormData({...formData, completion_date: e.target.value})}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Labor Cost (₱)</label>
                      <input
                        type="number"
                        value={formData.labor_cost}
                        onChange={(e) => setFormData({...formData, labor_cost: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Status</label>
                      <select
                        value={editingService.payment_status}
                        onChange={(e) => setEditingService({...editingService, payment_status: e.target.value as 'paid' | 'pending' | 'overdue'})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Parts Used Section */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">Parts/Materials Used</h3>
                    <button
                      onClick={addPartField}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all border border-emerald-200 hover:border-emerald-300"
                    >
                      + Add Part
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.parts_used.map((part: any, index: number) => (
                      <div key={index} className="grid grid-cols-4 gap-3 items-end bg-gray-50/80 p-3 rounded-xl border border-gray-200">
                        <div className="col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Part/Material Name</label>
                          <input
                            type="text"
                            value={part.name}
                            onChange={(e) => updatePartField(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                            placeholder="e.g., Hydraulic Pump, Caster Wheels"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Qty</label>
                          <input
                            type="number"
                            value={part.quantity}
                            onChange={(e) => updatePartField(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                            min="1"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cost (₱)</label>
                            <input
                              type="number"
                              value={part.cost}
                              onChange={(e) => updatePartField(index, 'cost', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                            />
                          </div>
                          {formData.parts_used.length > 1 && (
                            <button
                              onClick={() => removePartField(index)}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-all border border-red-200 hover:border-red-300"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                    placeholder="Any additional notes about the service..."
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingService(null)
                    }}
                    className="px-6 py-2.5 bg-white/80 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateService}
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold shadow-lg text-sm disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Service'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl mx-4"
            >
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200/60 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Service Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{selectedService.title}</h3>
                    <p className="text-gray-700 font-medium leading-relaxed text-sm">{selectedService.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-3 text-base">Service Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Equipment:</span>
                            <span className="font-semibold text-gray-900">{selectedService.equipment_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Client:</span>
                            <span className="font-semibold text-gray-900">{selectedService.client_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Location:</span>
                            <span className="font-semibold text-gray-900">{selectedService.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Technician:</span>
                            <span className="font-semibold text-gray-900">{selectedService.technician}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Duration:</span>
                            <span className="font-semibold text-gray-900">{selectedService.duration} hours</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-3 text-base">Cost Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Labor Cost:</span>
                            <span className="font-semibold text-gray-900">₱{selectedService.labor_cost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Parts Cost:</span>
                            <span className="font-semibold text-gray-900">
                              ₱{(selectedService.parts_used || []).reduce((sum: number, part: any) => sum + (part.cost * part.quantity), 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t border-gray-300 text-sm">
                            <span>Total Cost:</span>
                            <span>₱{selectedService.total_cost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-gray-600 font-medium">Payment:</span>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getPaymentStatusColor(selectedService.payment_status)}`}>
                              {selectedService.payment_status}
                            </span>
                          </div>
                        </div>
                      </div>
                  </div>
                  
                  {(selectedService.parts_used || []).length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 text-base">Parts/Materials Used</h4>
                      <div className="space-y-2">
                        {(selectedService.parts_used || []).map((part: any, index: number) => (
                          <div key={index} className="bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{part.name}</p>
                                <p className="text-xs text-gray-600 font-medium">Quantity: {part.quantity}</p>
                              </div>
                              <span className="font-bold text-gray-900 text-sm">₱{(part.cost * part.quantity).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedService.notes && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-base">Notes</h4>
                      <p className="text-gray-700 font-medium leading-relaxed bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl border border-gray-200 text-sm">{selectedService.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deletingService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-md w-full border border-white/20 shadow-2xl mx-4"
            >
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200/60 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Delete Service</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletingService(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-sm mr-4">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                    <p className="text-sm text-gray-600 font-medium">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 mb-6">
                  <p className="text-sm text-gray-700 font-medium mb-2">You are about to delete:</p>
                  <p className="font-bold text-gray-900 text-base">{deletingService.title}</p>
                  <p className="text-sm text-gray-600 font-medium">
                    {deletingService.equipment_type} - {deletingService.client_name}
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">Total Cost:</span>
                    <span className="font-bold text-gray-900">₱{deletingService.total_cost.toLocaleString()}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 font-medium mb-6">
                  Are you sure you want to delete this service record? This will permanently remove all associated data including parts used and payment information.
                </p>
                
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setDeletingService(null)
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white/80 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-semibold text-sm order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteService}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg text-sm disabled:opacity-50 order-1 sm:order-2"
                  >
                    {loading ? 'Deleting...' : 'Delete Service'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CompletedServices 