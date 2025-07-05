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
  DocumentTextIcon,
  ReceiptPercentIcon,
  ArrowPathIcon,
  DocumentCheckIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline'
import { pdf } from '@react-pdf/renderer'
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
import QuotationPDF from './QuotationPDF'
import PDFPreviewModal from './PDFPreviewModal'
import ServiceTypeSelectionModal from './ServiceTypeSelectionModal'
import { Dialog } from '@headlessui/react'

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
  const [filterDocument, setFilterDocument] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedService, setSelectedService] = useState<CompletedService | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingService, setEditingService] = useState<CompletedService | null>(null)
  const [deletingService, setDeletingService] = useState<CompletedService | null>(null)
  const [showPDFPreview, setShowPDFPreview] = useState(false)
  const [previewService, setPreviewService] = useState<CompletedService | null>(null)
  const [showServiceTypeSelectionModal, setShowServiceTypeSelectionModal] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)

  // Helper function to get dynamic text based on service type
  const getDynamicText = (field: string, type: string, isPlaceholder: boolean = false) => {
    const texts: { [key: string]: { [key: string]: { label: string; placeholder: string } } } = {
      title: {
        repair: { label: 'Repair Title', placeholder: 'e.g., Hospital Bed Hydraulic Repair' },
        checkup: { label: 'Checkup Title', placeholder: 'e.g., Annual Equipment Checkup' },
        maintenance: { label: 'Maintenance Title', placeholder: 'e.g., X-Ray Machine Preventive Maintenance' },
        installation: { label: 'Installation Title', placeholder: 'e.g., MRI Machine Installation' },
        calibration: { label: 'Calibration Title', placeholder: 'e.g., Defibrillator Calibration' },
        default: { label: 'Service Title', placeholder: 'e.g., General Service' },
      },
      description: {
        repair: { label: 'Repair Description', placeholder: 'Detailed explanation of the repair performed...' },
        checkup: { label: 'Inspection Findings', placeholder: 'Summarize the equipment condition and findings...' },
        maintenance: { label: 'Maintenance Details', placeholder: 'Details of preventive maintenance tasks performed...' },
        installation: { label: 'Installation Scope', placeholder: 'Scope of the installation service...' },
        calibration: { label: 'Calibration Details', placeholder: 'Specifics of the calibration process...' },
        default: { label: 'Description', placeholder: 'Detailed description of the service performed...' },
      },
      equipment_type: {
        default: { label: 'Equipment Type', placeholder: 'e.g., Hospital Bed, X-Ray Machine' },
      },
      client_name: {
        default: { label: 'Client Name', placeholder: 'e.g., St. Mary\'s Medical Center' },
      },
      location: {
        default: { label: 'Location', placeholder: 'e.g., Room 204, ICU Wing' },
      },
      technician: {
        default: { label: 'Technician', placeholder: 'e.g., John Smith' },
      },
      service_fee: {
        default: { label: 'Service Fee (₱)', placeholder: '' },
      },
      labor_cost: {
        default: { label: 'Labor Cost (₱)', placeholder: '' },
      },
      notes: {
        repair: { label: 'Additional Notes', placeholder: 'Any additional notes about the repair...' },
        checkup: { label: 'Recommendations/Notes', placeholder: 'Inspection findings, recommendations, equipment condition...' },
        maintenance: { label: 'Notes', placeholder: 'Any specific observations or future recommendations...' },
        installation: { label: 'Notes', placeholder: 'Pre-installation checks, post-installation verification...' },
        calibration: { label: 'Notes', placeholder: 'Calibration results, next calibration date...' },
        default: { label: 'Additional Notes', placeholder: 'Any additional notes...' },
      },
    }

    const fieldTexts = texts[field]?.[type] || texts[field]?.default
    if (!fieldTexts) return ''

    return isPlaceholder ? fieldTexts.placeholder : fieldTexts.label
  }

  // Function to determine if Parts Used section should be shown
  const shouldShowPartsSection = (serviceType: string) => {
    return serviceType !== 'checkup' && serviceType !== 'calibration'
  }

  // Form state for new service
  const [formData, setFormData] = useState({
    quotation_number: '',
    title: '',
    description: '',
    equipment_type: '',
    service_type: 'repair',
    client_name: '',
    location: '',
    service_date: '',
    completion_date: '',
    duration: 0,
    service_fee: 0,
    technician: '',
    parts_used: [{ name: '', quantity: 1, cost: 0, description: '' }],
    labor_cost: 0,
    notes: ''
  })

  // Load saved form data from localStorage
  useEffect(() => {
    const savedFormData = localStorage.getItem('vpmed_form_draft')
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData)
        setFormData(parsedData)
      } catch (error) {
        console.error('Error loading saved form data:', error)
      }
    }
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('vpmed_form_draft', JSON.stringify(formData))
  }, [formData])

  // Clear saved form data
  const clearSavedFormData = () => {
    localStorage.removeItem('vpmed_form_draft')
  }

  // Check if there's saved data
  const hasSavedData = () => {
    const savedData = localStorage.getItem('vpmed_form_draft')
    if (!savedData) return false
    try {
      const parsedData = JSON.parse(savedData)
      return Object.values(parsedData).some(value => 
        value !== '' && value !== 0 && 
        !(Array.isArray(value) && value.length === 1 && Object.values(value[0]).every(v => v === '' || v === 0 || v === 1))
      )
    } catch {
      return false
    }
  }

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
    const matchesDocument = filterDocument === 'all' || service.document_status === filterDocument
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDocument
  })

  const validateForm = () => {
    if (!formData.quotation_number.trim()) return 'Quotation Number is required.'
    if (!formData.title.trim()) return 'Title is required.'
    if (!formData.equipment_type.trim()) return 'Equipment Type is required.'
    if (!formData.service_type) return 'Service Type is required.'
    if (!formData.description.trim()) return 'Description is required.'
    if (!formData.client_name.trim()) return 'Client Name is required.'
    if (!formData.location.trim()) return 'Location is required.'
    if (!formData.technician.trim()) return 'Technician is required.'
    if (!formData.service_date) return 'Service Date is required.'
    if (!formData.completion_date) return 'Completion Date is required.'
    if (isNaN(formData.duration) || formData.duration <= 0) return 'Duration must be greater than 0.'
    if (isNaN(formData.service_fee) || formData.service_fee < 0) return 'Service Fee must be 0 or greater.'
    if (isNaN(formData.labor_cost) || formData.labor_cost < 0) return 'Labor Cost must be 0 or greater.'
    // Date logic
    const serviceDate = new Date(formData.service_date)
    const completionDate = new Date(formData.completion_date)
    if (serviceDate > completionDate) return 'Service Date cannot be after Completion Date.'
    // Parts validation (if shown)
    if (shouldShowPartsSection(formData.service_type)) {
      for (const part of formData.parts_used) {
        if (!part.name.trim()) return 'All parts must have a name.'
        if (isNaN(part.quantity) || part.quantity <= 0) return 'All parts must have a quantity greater than 0.'
        if (isNaN(part.cost) || part.cost < 0) return 'All parts must have a cost of 0 or greater.'
      }
    }
    return null
  }

  const handleAddService = async () => {
    const error = validateForm()
    if (error) {
      setFormError(error)
      setShowErrorModal(true)
      return
    }
    try {
      setLoading(true)
      const serviceData: CreateServiceData = {
        ...formData,
        service_type: formData.service_type as 'repair' | 'checkup' | 'installation' | 'calibration',
        parts_used: formData.parts_used.filter(part => part.name.trim() !== '')
      }
      await createCompletedService(serviceData)
      await loadServicesAndStats() // Refresh data
      setShowAddModal(false)
      clearSavedFormData()
      const resetFormData = {
        quotation_number: '',
        title: '',
        description: '',
        equipment_type: '',
        service_type: 'repair',
        client_name: '',
        location: '',
        service_date: '',
        completion_date: '',
        duration: 0,
        service_fee: 0,
        technician: '',
        parts_used: [{ name: '', quantity: 1, cost: 0, description: '' }],
        labor_cost: 0,
        notes: ''
      }
      setFormData(resetFormData)
    } catch (error) {
      setFormError('Error adding service. Please try again.')
      setShowErrorModal(true)
      console.error('Error adding service:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPartField = () => {
    setFormData({
      ...formData,
      parts_used: [...formData.parts_used, { name: '', quantity: 1, cost: 0, description: '' }]
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

  const handleUpdateServiceStatus = async (serviceId: string, newStatus: 'approved' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      // Import the update function from the API
      const { updateCompletedService } = await import('../lib/completedServicesApi')
      
      await updateCompletedService(serviceId, { status: newStatus })
      
      await loadServicesAndStats() // Refresh data
    } catch (error) {
      console.error('Error updating service status:', error)
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'approved': return 'in_progress'
      case 'in_progress': return 'completed'
      default: return null
    }
  }

  const getStatusAction = (currentStatus: string) => {
    switch (currentStatus) {
      case 'approved': return 'Start Work'
      case 'in_progress': return 'Mark Complete'
      default: return null
    }
  }

  const getDocumentStatusAction = (currentDocumentStatus: string, serviceStatus: string) => {
    if (currentDocumentStatus === 'quotation' && serviceStatus === 'completed') {
      return 'Create Invoice'
    }
    return null
  }

  const handleCreateInvoice = async (serviceId: string) => {
    try {
      const { updateCompletedService } = await import('../lib/completedServicesApi')
      await updateCompletedService(serviceId, { 
        document_status: 'invoiced',
        payment_status: 'pending' // Set payment to pending when invoice is created
      })
      await loadServicesAndStats() // Refresh data
      console.log('Invoice created successfully! You can now send this to the client.')
    } catch (error) {
      console.error('Error creating invoice:', error)
    }
  }

  const handlePrintQuotation = (service: CompletedService) => {
    setPreviewService(service)
    setShowPDFPreview(true)
  }

  const handleEditService = (service: CompletedService) => {
    setEditingService(service)
    setFormData({
      quotation_number: service.quotation_number || '',
      title: service.title,
      description: service.description,
      equipment_type: service.equipment_type,
      service_type: service.service_type || 'repair',
      client_name: service.client_name,
      location: service.location,
      service_date: service.service_date,
      completion_date: service.completion_date,
      duration: service.duration,
      service_fee: service.service_fee,
      technician: service.technician,
      parts_used: service.parts_used?.map(part => ({
        ...part,
        description: part.description || ''
      })) || [{ name: '', quantity: 1, cost: 0, description: '' }],
      labor_cost: service.labor_cost,
      notes: service.notes || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateService = async () => {
    if (!editingService) return
    const error = validateForm()
    if (error) {
      setFormError(error)
      setShowErrorModal(true)
      return
    }
    try {
      setLoading(true)
      const serviceData: CreateServiceData = {
        ...formData,
        service_type: formData.service_type as 'repair' | 'checkup' | 'installation' | 'calibration',
        parts_used: formData.parts_used.filter(part => part.name.trim() !== '')
      }
      await updateCompletedServiceWithParts(editingService.id, serviceData)
      await loadServicesAndStats() // Refresh data
      setShowEditModal(false)
      setEditingService(null)
      clearSavedFormData()
      const resetFormData = {
        quotation_number: '',
        title: '',
        description: '',
        equipment_type: '',
        service_type: 'repair',
        client_name: '',
        location: '',
        service_date: '',
        completion_date: '',
        duration: 0,
        service_fee: 0,
        technician: '',
        parts_used: [{ name: '', quantity: 1, cost: 0, description: '' }],
        labor_cost: 0,
        notes: ''
      }
      setFormData(resetFormData)
    } catch (error) {
      setFormError('Error updating service. Please try again.')
      setShowErrorModal(true)
      console.error('Error updating service:', error)
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
      case 'quotation': return <DocumentTextIcon className="h-5 w-5 text-blue-500" />
      case 'approved': return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'in_progress': return <ArrowPathIcon className="h-5 w-5 text-yellow-500" />
      case 'completed': return <DocumentCheckIcon className="h-5 w-5 text-emerald-500" />
      case 'invoiced': return <ReceiptPercentIcon className="h-5 w-5 text-purple-500" />
      default: return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quotation': return 'bg-gradient-to-r from-blue-100 to-blue-100 text-blue-800 border border-blue-200'
      case 'approved': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
      case 'in_progress': return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200'
      case 'completed': return 'bg-gradient-to-r from-emerald-100 to-emerald-100 text-emerald-800 border border-emerald-200'
      case 'invoiced': return 'bg-gradient-to-r from-purple-100 to-purple-100 text-purple-800 border border-purple-200'
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200'
    }
  }

  const handleSelectServiceType = (type: string) => {
    setFormData(prev => ({ ...prev, service_type: type }))
    setShowAddModal(true)
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
              Service Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              Manage quotations, work orders, and invoices for medical equipment repair services
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 sm:px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm relative"
            >
              <DocumentTextIcon className="h-4 w-4" />
              <span className="sm:inline">Create Quotation</span>
              {hasSavedData() && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full animate-pulse border-2 border-white" title="You have unsaved draft data"></span>
              )}
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
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
              <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Active Quotations</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{statistics.totalServices}</p>
              <p className="text-xs text-gray-500 font-medium">Pending approval</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 shadow-sm">
              <ArrowPathIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Work Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {statistics.paidServices}
              </p>
              <p className="text-xs text-gray-500 font-medium">In progress</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-sm">
              <DocumentCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Completed Services</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {statistics.paidServices}
              </p>
              <p className="text-xs text-gray-500 font-medium">Work finished</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:shadow-gray-300/30 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-sm">
              <ReceiptPercentIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                ₱{statistics.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 font-medium">From invoiced services</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 sm:px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-900 text-sm w-full shadow-sm"
            >
              <option value="all">All Service Status</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={filterDocument}
              onChange={(e) => setFilterDocument(e.target.value)}
              className="px-3 sm:px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-900 text-sm w-full shadow-sm"
            >
              <option value="all">All Document Status</option>
              <option value="quotation">Quotation</option>
              <option value="invoiced">Invoiced</option>
            </select>
            
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="px-3 sm:px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-900 text-sm w-full shadow-sm"
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending Payment</option>
              <option value="paid">Paid</option>
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">Service Records</h3>
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
                      <div className="flex flex-wrap gap-2">
                        {/* Service Type Badge */}
                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full self-start ${
                            service.service_type === 'repair' ? 'bg-red-100 text-red-800 border border-red-200'
                            : service.service_type === 'checkup' ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : service.service_type === 'installation' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : service.service_type === 'calibration' ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {service.service_type === 'repair' ? '🔧 Repair'
                          : service.service_type === 'checkup' ? '🩺 Checkup'
                          : service.service_type === 'installation' ? '🔌 Installation'
                          : service.service_type === 'calibration' ? '📏 Calibration'
                          : service.service_type}
                        </span>
                        {/* Service Status Badge */}
                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full self-start ${getStatusColor(service.status)}`}>
                          🔧 {service.status}
                        </span>
                        
                        {/* Document Status Badge */}
                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full self-start ${
                          service.document_status === 'quotation' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {service.document_status === 'quotation' ? '📄 Quotation' : '🧾 Invoiced'}
                        </span>
                        
                        {/* Payment Status Badge */}
                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full self-start ${service.payment_status === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' : service.payment_status === 'overdue' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                          {service.payment_status === 'pending' ? '💰 Pending Payment' : service.payment_status === 'paid' ? '✅ Paid' : '⚠️ Overdue'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium">{service.equipment_type} - {service.client_name}</p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {/* Print Quotation button - only show for quotation document status */}
                    {service.document_status === 'quotation' && (
                      <button
                        onClick={() => handlePrintQuotation(service)}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1"
                        title="Print Quotation"
                      >
                        <PrinterIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Print</span>
                      </button>
                    )}
                    
                    {/* Status progression button */}
                    {getNextStatus(service.status) && (
                      <button
                        onClick={() => handleUpdateServiceStatus(service.id, getNextStatus(service.status) as any)}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                        title={`${getStatusAction(service.status)} this service`}
                      >
                        {getStatusAction(service.status)}
                      </button>
                    )}

                    {/* Create Invoice button - only show when service is completed and still has quotation document status */}
                    {getDocumentStatusAction(service.document_status, service.status) && (
                      <button
                        onClick={() => handleCreateInvoice(service.id)}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Create Invoice"
                      >
                        {getDocumentStatusAction(service.document_status, service.status)}
                      </button>
                    )}
                    
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
            <h3 className="mt-3 text-sm sm:text-base font-semibold text-gray-900">No service records found</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 font-medium px-4">Get started by creating your first service quotation.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 sm:px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold text-sm"
            >
              Create First Quotation
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
                <div className="flex items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create Service Quotation</h2>
                  {hasSavedData() && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full border border-orange-200">
                        📝 Draft Saved
                      </span>
                      <button
                        onClick={() => {
                          clearSavedFormData()
                          const resetFormData = {
                            quotation_number: '',
                            title: '',
                            description: '',
                            equipment_type: '',
                            service_type: 'repair',
                            client_name: '',
                            location: '',
                            service_date: '',
                            completion_date: '',
                            duration: 0,
                            service_fee: 0,
                            technician: '',
                            parts_used: [{ name: '', quantity: 1, cost: 0, description: '' }],
                            labor_cost: 0,
                            notes: ''
                          }
                          setFormData(resetFormData)
                        }}
                        className="text-orange-600 hover:text-orange-700 text-xs font-semibold bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition-all border border-orange-200 hover:border-orange-300"
                        title="Clear saved draft"
                      >
                        Clear Draft
                      </button>
                    </div>
                  )}
                </div>
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
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quotation Number</label>
                      <input
                        type="text"
                        value={formData.quotation_number}
                        onChange={(e) => setFormData({...formData, quotation_number: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="e.g., Q-2024-001"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('title', formData.service_type)}</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder={getDynamicText('title', formData.service_type, true)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('equipment_type', formData.service_type)}</label>
                      <input
                        type="text"
                        value={formData.equipment_type}
                        onChange={(e) => setFormData({...formData, equipment_type: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder={getDynamicText('equipment_type', formData.service_type, true)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Type</label>
                      <select
                        value={formData.service_type}
                        onChange={(e) => setFormData({...formData, service_type: e.target.value as any})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                      >
                        <option value="repair">🔧 Repair Service</option>
                        <option value="checkup">🩺 Equipment Checkup</option>
                        <option value="installation">🔌 Installation Service</option>
                        <option value="calibration">📏 Calibration Service</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('description', formData.service_type)}</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder={getDynamicText('description', formData.service_type, true)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('client_name', formData.service_type)}</label>
                      <input
                        type="text"
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder={getDynamicText('client_name', formData.service_type, true)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('location', formData.service_type)}</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder={getDynamicText('location', formData.service_type, true)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('technician', formData.service_type)}</label>
                      <input
                        type="text"
                        value={formData.technician}
                        onChange={(e) => setFormData({...formData, technician: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder={getDynamicText('technician', formData.service_type, true)}
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('service_fee', formData.service_type)}</label>
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
                          max={formData.completion_date || undefined}
                          value={formData.service_date}
                          onChange={(e) => setFormData({...formData, service_date: e.target.value})}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Completion Date</label>
                        <input
                          type="date"
                          min={formData.service_date || undefined}
                          value={formData.completion_date}
                          onChange={(e) => setFormData({...formData, completion_date: e.target.value})}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('labor_cost', formData.service_type)}</label>
                      <input
                        type="number"
                        value={formData.labor_cost}
                        onChange={(e) => setFormData({...formData, labor_cost: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Parts Used Section - Conditional based on service type */}
                {shouldShowPartsSection(formData.service_type) && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-gray-900">
                        Parts/Materials Used
                      </h3>
                      <button
                        onClick={addPartField}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all border border-emerald-200 hover:border-emerald-300"
                      >
                        + Add Part
                      </button>
                    </div>
                    
                    {formData.service_type === 'checkup' && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-800 font-medium">
                          💡 For equipment checkups, parts are typically not required unless issues are found during inspection.
                        </p>
                      </div>
                    )}
                    
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
                              placeholder={getDynamicText('parts_used', formData.service_type, true)}
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
                )}
                
                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('notes', formData.service_type)}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                    placeholder={getDynamicText('notes', formData.service_type, true)}
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
                    Create Quotation
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
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200/60 flex items-center justify-between">
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
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quotation Number</label>
                      <input
                        type="text"
                        value={formData.quotation_number}
                        onChange={(e) => setFormData({...formData, quotation_number: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder="e.g., Q-2024-001"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('title', formData.service_type)}</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder={getDynamicText('title', formData.service_type, true)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('equipment_type', formData.service_type)}</label>
                      <input
                        type="text"
                        value={formData.equipment_type}
                        onChange={(e) => setFormData({...formData, equipment_type: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder={getDynamicText('equipment_type', formData.service_type, true)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Type</label>
                      <select
                        value={formData.service_type}
                        onChange={(e) => setFormData({...formData, service_type: e.target.value as any})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                      >
                        <option value="repair">🔧 Repair Service</option>
                        <option value="checkup">🩺 Equipment Checkup</option>
                        <option value="installation">🔌 Installation Service</option>
                        <option value="calibration">📏 Calibration Service</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('description', formData.service_type)}</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder={getDynamicText('description', formData.service_type, true)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('client_name', formData.service_type)}</label>
                      <input
                        type="text"
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder={getDynamicText('client_name', formData.service_type, true)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('location', formData.service_type)}</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder={getDynamicText('location', formData.service_type, true)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('technician', formData.service_type)}</label>
                      <input
                        type="text"
                        value={formData.technician}
                        onChange={(e) => setFormData({...formData, technician: e.target.value})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        placeholder={getDynamicText('technician', formData.service_type, true)}
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('service_fee', formData.service_type)}</label>
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
                          max={formData.completion_date || undefined}
                          value={formData.service_date}
                          onChange={(e) => setFormData({...formData, service_date: e.target.value})}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Completion Date</label>
                        <input
                          type="date"
                          min={formData.service_date || undefined}
                          value={formData.completion_date}
                          onChange={(e) => setFormData({...formData, completion_date: e.target.value})}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('labor_cost', formData.service_type)}</label>
                      <input
                        type="number"
                        value={formData.labor_cost}
                        onChange={(e) => setFormData({...formData, labor_cost: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Parts Used Section - Conditional based on service type */}
                {shouldShowPartsSection(formData.service_type) && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-gray-900">
                        Parts/Materials Used
                      </h3>
                      <button
                        onClick={addPartField}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all border border-emerald-200 hover:border-emerald-300"
                      >
                        + Add Part
                      </button>
                    </div>
                    
                    {formData.service_type === 'checkup' && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-800 font-medium">
                          💡 For equipment checkups, parts are typically not required unless issues are found during inspection.
                        </p>
                      </div>
                    )}
                    
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
                              placeholder={getDynamicText('parts_used', formData.service_type, true)}
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
                )}
                
                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{getDynamicText('notes', formData.service_type)}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all text-sm shadow-sm"
                    placeholder={getDynamicText('notes', formData.service_type, true)}
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
                            <span className="text-gray-600 font-medium">Service Status:</span>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(selectedService.status)}`}>
                              🔧 {selectedService.status}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-gray-600 font-medium">Document:</span>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                              selectedService.document_status === 'quotation' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}>
                              {selectedService.document_status === 'quotation' ? '📄 Quotation' : '🧾 Invoiced'}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-gray-600 font-medium">Payment:</span>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${selectedService.payment_status === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' : selectedService.payment_status === 'overdue' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                              {selectedService.payment_status === 'pending' ? '💰 Pending Payment' : selectedService.payment_status === 'paid' ? '✅ Paid' : '⚠️ Overdue'}
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

      {/* PDF Preview Modal */}
      {previewService && (
        <PDFPreviewModal
          service={previewService}
          isOpen={showPDFPreview}
          onClose={() => {
            setShowPDFPreview(false)
            setPreviewService(null)
          }}
        />
      )}

      {/* Service Type Selection Modal */}
      <ServiceTypeSelectionModal
        isOpen={showServiceTypeSelectionModal}
        onClose={() => setShowServiceTypeSelectionModal(false)}
        onSelectServiceType={handleSelectServiceType}
      />

      {/* Error Modal */}
      <Dialog open={showErrorModal} onClose={() => setShowErrorModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl border border-red-200 relative z-10">
            <Dialog.Title className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              Error
            </Dialog.Title>
            <Dialog.Description className="text-gray-700 mb-4">
              {formError}
            </Dialog.Description>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all mt-2"
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default CompletedServices 