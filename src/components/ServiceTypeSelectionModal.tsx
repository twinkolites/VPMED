import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ServiceTypeSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectServiceType: (serviceType: string) => void
}

const ServiceTypeSelectionModal: React.FC<ServiceTypeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectServiceType,
}) => {
  const [selectedType, setSelectedType] = useState('repair') // Default to repair

  if (!isOpen) return null

  const handleContinue = () => {
    onSelectServiceType(selectedType)
    onClose() // Close this modal after selection
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Select Service Type</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl transition-all"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-sm text-gray-700 mb-4">Please choose the type of service you want to create:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => onSelectServiceType('repair')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold shadow-md"
                >
                  🔧 Repair Service
                </button>
                <button
                  onClick={() => onSelectServiceType('checkup')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold shadow-md"
                >
                  �� Equipment Checkup
                </button>
                <button
                  onClick={() => onSelectServiceType('installation')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all font-semibold shadow-md"
                >
                  🔌 Installation Service
                </button>
                <button
                  onClick={() => onSelectServiceType('calibration')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all font-semibold shadow-md"
                >
                  📏 Calibration Service
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white/80 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-semibold text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ServiceTypeSelectionModal 