import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { 
  Wrench, 
  Settings, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  Award,
  Stethoscope,
  Activity,
  Zap,
  Wrench as ToolIcon,
  Search,
  Filter,
  Star,
  Users,
  TrendingUp,
  Heart,
  Gauge
} from 'lucide-react';
import type { ServiceItem } from '../types';

// Comprehensive service offerings
const services: ServiceItem[] = [
  // Emergency & Critical Repairs
  {
    id: 'emergency-repair',
    title: 'Emergency Equipment Repair',
    description: 'Critical 24-hour emergency repair services for life-support and essential medical equipment. Our certified technicians respond rapidly to minimize patient care disruption.',
    category: 'repair',
    equipmentTypes: ['Ventilators', 'Defibrillators', 'Patient Monitors', 'IV Pumps', 'Dialysis Machines']
  },
  {
    id: 'diagnostic-imaging-repair',
    title: 'Diagnostic Imaging Equipment Repair',
    description: 'Specialized repair services for complex imaging equipment including calibration, component replacement, and software updates to maintain diagnostic accuracy.',
    category: 'repair',
    equipmentTypes: ['X-Ray Machines', 'MRI Systems', 'CT Scanners', 'Ultrasound Equipment', 'Mammography Units']
  },
  {
    id: 'surgical-equipment-repair',
    title: 'Surgical Equipment Repair',
    description: 'Precision repair services for operating room equipment ensuring sterile functionality and surgical precision for critical procedures.',
    category: 'repair',
    equipmentTypes: ['Surgical Tables', 'Anesthesia Machines', 'Electrosurgical Units', 'Surgical Lights', 'Laparoscopic Equipment']
  },
  {
    id: 'laboratory-equipment-repair',
    title: 'Laboratory Equipment Repair',
    description: 'Specialized repair services for clinical laboratory equipment ensuring accurate test results and regulatory compliance.',
    category: 'repair',
    equipmentTypes: ['Analyzers', 'Centrifuges', 'Microscopes', 'Incubators', 'Spectrophotometers']
  },
  {
    id: 'patient-monitoring-repair',
    title: 'Patient Monitoring Equipment Repair',
    description: 'Expert repair services for patient monitoring systems ensuring continuous and accurate patient data collection.',
    category: 'repair',
    equipmentTypes: ['Vital Signs Monitors', 'Telemetry Systems', 'Pulse Oximeters', 'ECG Machines', 'Blood Pressure Monitors']
  },
  {
    id: 'respiratory-equipment-repair',
    title: 'Respiratory Equipment Repair',
    description: 'Critical repair services for respiratory care equipment ensuring optimal patient ventilation and oxygen delivery.',
    category: 'repair',
    equipmentTypes: ['Ventilators', 'CPAP Machines', 'Oxygen Concentrators', 'Nebulizers', 'Anesthesia Machines']
  }
];

const serviceCategories = [
  { 
    key: 'all', 
    label: 'All Services', 
    icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" />,
    count: services.length,
    color: 'emerald'
  },
  { 
    key: 'repair', 
    label: 'Equipment Repair', 
    icon: <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />,
    count: services.filter(s => s.category === 'repair').length,
    color: 'red'
  }
];

const processSteps = [
  {
    step: '01',
    title: 'Initial Assessment',
    description: 'Comprehensive evaluation of equipment condition, failure analysis, and diagnostic testing to identify root causes.',
    icon: <Search className="w-6 h-6 sm:w-8 sm:h-8" />,
    color: 'emerald'
  },
  {
    step: '02',
    title: 'Detailed Quote',
    description: 'Transparent pricing with detailed breakdown of labor, parts, and timeline. No hidden fees or surprise costs.',
    icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />,
    color: 'blue'
  },
  {
    step: '03',
    title: 'Expert Repair',
    description: 'Certified technicians perform repairs using OEM parts and manufacturer-approved procedures.',
    icon: <ToolIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
    color: 'orange'
  },
  {
    step: '04',
    title: 'Quality Assurance',
    description: 'Comprehensive testing, calibration verification, and performance validation before equipment return.',
    icon: <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />,
    color: 'green'
  }
];

const Services: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const shouldReduceMotion = useReducedMotion();

  // Enhanced Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0.05 : 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        duration: shouldReduceMotion ? 0.3 : 0.6
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: shouldReduceMotion ? 4 : 6,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.equipmentTypes.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'repair': return <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />;
      default: return <Settings className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'repair': return 'from-red-500 to-red-600';
      default: return 'from-emerald-500 to-emerald-600';
    }
  };

  // Enhanced Floating Medical Icon Component for Mobile
  const FloatingMedicalIcon: React.FC<{ 
    icon: React.ReactNode; 
    delay: number; 
    className?: string;
    color: string;
  }> = ({ icon, delay, className = '', color }) => (
    <motion.div
      className={`${className} opacity-30 sm:opacity-40 lg:opacity-30`}
      animate={floatingVariants.animate}
      transition={{ delay }}
      whileHover={{
        scale: shouldReduceMotion ? 1.02 : 1.1,
        opacity: shouldReduceMotion ? 0.5 : 0.6,
        transition: { type: "spring" as const, stiffness: 300 }
      }}
    >
      <motion.div
        className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${color}`}
        animate={{
          rotate: shouldReduceMotion ? [0, 180, 360] : [0, 360],
        }}
        transition={{
          duration: shouldReduceMotion ? 8 : 20,
          repeat: Infinity,
          ease: "linear",
          delay: delay * 2
        }}
      >
        {icon}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Enhanced Premium Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-br from-slate-900 to-emerald-900 text-white overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]"
          animate={{
            background: [
              "radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)",
              "radial-gradient(circle_at_30%_70%,rgba(16,185,129,0.15),transparent_70%)",
              "radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.1),transparent_70%)",
              "radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Enhanced Floating Service Icons - Now Visible on Mobile */}
        <FloatingMedicalIcon
          delay={0}
          className="absolute top-12 left-4 sm:top-16 sm:left-12 lg:top-20 lg:left-20"
          icon={<Stethoscope className="w-full h-full" />}
          color="text-emerald-400"
        />
        
        <FloatingMedicalIcon
          delay={1}
          className="absolute top-20 right-4 sm:top-24 sm:right-12 lg:top-32 lg:right-24"
          icon={<Activity className="w-full h-full" />}
          color="text-blue-400"
        />
        
        <FloatingMedicalIcon
          delay={2}
          className="absolute bottom-20 left-6 sm:bottom-24 sm:left-12 lg:bottom-32 lg:left-24"
          icon={<Heart className="w-full h-full" />}
          color="text-red-400"
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
              variants={itemVariants}
            >
              Professional <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Medical Equipment</span> Services
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl text-slate-300 mb-6 sm:mb-8 leading-relaxed px-2"
              variants={itemVariants}
            >
              Comprehensive repair, maintenance, and compliance services for healthcare facilities. 
              Certified technicians ensuring your critical equipment operates at peak performance.
            </motion.p>
            
            {/* Enhanced Key Benefits - Mobile Optimized */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-6 mt-8 sm:mt-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { value: "OEM", label: "Certified Parts", color: "text-purple-400" },
                { value: "30+", label: "Years Experience", color: "text-orange-400" }
              ].map((benefit, index) => (
                <motion.div 
                  key={benefit.value}
                  className="text-center"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: shouldReduceMotion ? 1.01 : 1.05,
                    transition: { type: "spring" as const, stiffness: 300 }
                  }}
                >
                  <div className={`text-2xl sm:text-3xl font-bold ${benefit.color} mb-1 sm:mb-2`}>
                    {benefit.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400">{benefit.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Search and Filter Section */}
      <section className="py-6 sm:py-8 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-6 lg:items-center lg:justify-between">
            {/* Enhanced Search Bar */}
            <div className="relative w-full lg:flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search services or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 text-sm sm:text-base"
              />
            </div>

            {/* Enhanced Category Filters - Mobile Optimized */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-end">
              {serviceCategories.map((category) => (
                <motion.button
                  key={category.key}
                  whileHover={{ scale: shouldReduceMotion ? 1.01 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-xs sm:text-sm ${
                    selectedCategory === category.key
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                      : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.label}</span>
                  <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                  <span className="bg-slate-100 text-slate-600 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    {category.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Services Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <AnimatePresence>
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  layout
                  variants={itemVariants}
                  whileHover={{ 
                    y: shouldReduceMotion ? 0 : -8,
                    scale: shouldReduceMotion ? 1 : 1.02,
                    transition: { type: "spring" as const, stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden group border border-slate-200 hover:border-emerald-300 transition-all duration-300 cursor-pointer"
                >
                  {/* Enhanced Service Header */}
                  <div className="p-4 sm:p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <motion.div 
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r ${getCategoryColor(service.category)} flex items-center justify-center text-white`}
                        whileHover={{ 
                          scale: shouldReduceMotion ? 1.02 : 1.1,
                          rotate: shouldReduceMotion ? 0 : [0, -5, 5, 0],
                          transition: { duration: 0.3 }
                        }}
                      >
                        {getCategoryIcon(service.category)}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2">
                          {service.title}
                        </h3>
                        <span className="text-xs sm:text-sm text-slate-500 capitalize">{service.category}</span>
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  {/* Enhanced Equipment Types */}
                  <div className="p-4 sm:p-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Gauge className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                      Equipment Types:
                    </h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {service.equipmentTypes.map((type, typeIndex) => (
                        <motion.span 
                          key={type}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + typeIndex * 0.05 }}
                          whileHover={{ 
                            scale: shouldReduceMotion ? 1 : 1.05,
                            backgroundColor: "rgb(209 250 229)",
                            color: "rgb(5 150 105)"
                          }}
                          className="bg-slate-100 text-slate-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer"
                        >
                          {type}
                        </motion.span>
                      ))}
                    </div>

                    {/* Enhanced Service Features */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
                        <motion.div 
                          className="flex items-center gap-2 text-emerald-600"
                          whileHover={{ x: shouldReduceMotion ? 0 : 3 }}
                        >
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>FDA Compliant</span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-2 text-blue-600"
                          whileHover={{ x: shouldReduceMotion ? 0 : 3 }}
                        >
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Fast Response</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Enhanced No Results Message */}
          {filteredServices.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-16"
            >
              <motion.div 
                className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
              </motion.div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">No Services Found</h3>
              <p className="text-slate-600 text-sm sm:text-base">Try adjusting your search terms or category filters.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Enhanced Professional Process Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 to-emerald-900 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Our <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Professional</span> Process
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto px-2">
              A systematic approach ensuring quality, transparency, and reliability in every service we provide
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={itemVariants}
                whileHover={{
                  scale: shouldReduceMotion ? 1.01 : 1.05,
                  y: shouldReduceMotion ? 0 : -5,
                  transition: { type: "spring" as const, stiffness: 300 }
                }}
                className="text-center group"
              >
                <div className="relative mb-4 sm:mb-6">
                  <motion.div 
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 flex items-center justify-center mx-auto shadow-lg`}
                    whileHover={{ 
                      scale: shouldReduceMotion ? 1.02 : 1.1,
                      rotate: shouldReduceMotion ? 0 : [0, -5, 5, 0],
                      transition: { duration: 0.3 }
                    }}
                  >
                    {step.icon}
                  </motion.div>
                  <motion.div 
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  >
                    <span className="text-slate-900 font-bold text-xs sm:text-sm">{step.step}</span>
                  </motion.div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{step.title}</h3>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Service Guarantees */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              Our Service Guarantees
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto px-2">
              We stand behind our work with comprehensive guarantees and professional standards
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: 'Quality Guarantee',
                description: 'All repairs backed by our comprehensive quality guarantee and warranty coverage.',
                color: 'emerald'
              },
              {
                icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: 'Timely Service',
                description: 'Committed delivery times with progress updates throughout the repair process.',
                color: 'blue'
              },
              {
                icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: 'Certified Technicians',
                description: 'Factory-trained and certified technicians with ongoing education and training.',
                color: 'purple'
              },
              
              {
                icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: 'Customer Support',
                description: 'Dedicated customer support team available for questions and follow-up service.',
                color: 'orange'
              },
              
            ].map((guarantee, index) => (
              <motion.div
                key={guarantee.title}
                variants={itemVariants}
                whileHover={{
                  y: shouldReduceMotion ? 0 : -5,
                  scale: shouldReduceMotion ? 1 : 1.02,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  transition: { type: "spring" as const, stiffness: 300 }
                }}
                className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center group hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <motion.div 
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-r ${
                    guarantee.color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
                    guarantee.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    guarantee.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    'from-orange-500 to-orange-600'
                  } flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white`}
                  whileHover={{ 
                    scale: shouldReduceMotion ? 1.02 : 1.1,
                    rotate: shouldReduceMotion ? 0 : [0, -10, 10, 0],
                    transition: { duration: 0.3 }
                  }}
                >
                  {guarantee.icon}
                </motion.div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{guarantee.title}</h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{guarantee.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Important Service Information */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-b border-amber-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-amber-200"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Important Service Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Service Scheduling</h4>
                      <ul className="text-slate-700 space-y-1 text-xs sm:text-sm">
                        <li>• All services require advance scheduling</li>
                        
                        <li>• Pickup and delivery coordination</li>
                        <li>• Loaner equipment available when possible</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Pricing & Parts</h4>
                      <ul className="text-slate-700 space-y-1 text-xs sm:text-sm">
                        <li>• Transparent diagnostic-based pricing</li>
                        <li>• OEM and high-quality aftermarket parts</li>
                        <li>• Parts availability may affect timelines</li>
                        <li>• Written estimates provided before work</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Schedule Service?
            </h2>
            <p className="text-lg sm:text-xl text-emerald-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Get your medical equipment back to peak performance with our professional repair and maintenance services.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-lg mx-auto">
              
              <motion.button
                whileHover={{ scale: shouldReduceMotion ? 1.01 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-emerald-600 transition-all duration-300 text-base sm:text-lg"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                Contact Us
              </motion.button>
            </div>

            {/* Enhanced Contact Info */}
            <motion.div 
              className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center text-emerald-100 text-sm sm:text-base"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { icon: Mail, text: "Professional Service Team" },
                { icon: CheckCircle, text: "Licensed & Insured" }
              ].map((item, index) => (
                <motion.div 
                  key={item.text}
                  className="flex items-center gap-2"
                  variants={itemVariants}
                  whileHover={{ x: shouldReduceMotion ? 0 : 3 }}
                >
                  <item.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services; 
