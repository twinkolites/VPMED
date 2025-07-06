import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Shield, 
  Award, 
  Heart,
  ChevronUp,
  Stethoscope,
  Settings,
  Activity,
  CheckCircle,
  Facebook,
  Instagram,
  MessageCircle,
  Star
} from 'lucide-react';
import vpmedLogo from '../../assets/images/vpmed.jpg';

const Footer: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  const services = [
    'Equipment Repair',
    'Compliance Testing',
    'Parts Replacement',
    'Calibration Services',
    'Fabrication Services',
    'Refurbishment Services',
  ];

  // Enhanced Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        duration: shouldReduceMotion ? 0.3 : 0.6
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: shouldReduceMotion ? 4 : 6,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  // Enhanced Floating Medical Icon Component
  const FloatingMedicalIcon: React.FC<{ 
    icon: React.ReactNode; 
    delay: number; 
    className?: string;
    color: string;
  }> = ({ icon, delay, className = '', color }) => (
    <motion.div
      className={`${className} opacity-40 sm:opacity-20 ${shouldReduceMotion ? '' : 'animate-pulse'}`}
      animate={floatingAnimation}
      transition={{ delay }}
      whileHover={{
        scale: shouldReduceMotion ? 1.02 : 1.1,
        opacity: shouldReduceMotion ? 0.6 : 0.3,
        transition: { type: "spring" as const, stiffness: 300 }
      }}
    >
      <motion.div
        className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 ${color}`}
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
    <footer className="relative bg-slate-900 text-white overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-green-900/20"></div>
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)]"
          animate={{
            background: [
              "radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)",
              "radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.15),transparent_50%)",
              "radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.1),transparent_50%)]"
          animate={{
            background: [
              "radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.1),transparent_50%)",
              "radial-gradient(circle_at_20%_80%,rgba(239,68,68,0.08),transparent_50%)",
              "radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.1),transparent_50%)"
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Enhanced Floating Medical Icons with Mobile Visibility */}
      <FloatingMedicalIcon
        delay={0}
        className="absolute top-8 left-4 sm:top-10 sm:left-20"
        icon={<Stethoscope className="w-full h-full" />}
        color="text-green-400"
      />
      
      <FloatingMedicalIcon
        delay={1}
        className="absolute top-16 right-4 sm:top-20 sm:right-32"
        icon={<Activity className="w-full h-full" />}
        color="text-red-400"
      />
      
      <FloatingMedicalIcon
        delay={2}
        className="absolute bottom-24 right-6 sm:bottom-32 sm:right-20"
        icon={<Settings className="w-full h-full" />}
        color="text-green-400"
      />

      <div className="relative z-10">
        {/* Enhanced Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            
            {/* Enhanced Company Info */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-1"
            >
              <div className="mb-6 sm:mb-8">
                {/* Enhanced Logo */}
                <motion.div 
                  className="flex items-center space-x-3 mb-4 sm:mb-6"
                  whileHover={{ scale: shouldReduceMotion ? 1.01 : 1.02 }}
                  transition={{ type: "spring" as const, stiffness: 300 }}
                >
                  <div className="relative">
                    <motion.img 
                      src={vpmedLogo} 
                      alt="VPMED Logo" 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl shadow-lg object-cover"
                      whileHover={{ 
                        rotate: shouldReduceMotion ? 0 : [0, -5, 5, 0],
                        transition: { duration: 0.3 }
                      }}
                    />
                    <motion.div 
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: shouldReduceMotion ? 0 : [0, 360]
                      }}
                      transition={{ 
                        scale: { duration: 2, repeat: Infinity },
                        rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                      }}
                    >
                      <Heart className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                    </motion.div>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">VPMED</span>
                    <div className="text-xs text-green-400 font-bold tracking-wider">MEDICAL EQUIPMENT SERVICES</div>
                  </div>
                </motion.div>
                
                <motion.p 
                  className="text-gray-300 leading-relaxed mb-6 sm:mb-8 text-base sm:text-lg"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Your trusted partner for professional medical equipment repair, maintenance, and compliance services. 
                  Serving healthcare facilities with excellence and reliability since 2022.
                </motion.p>

                {/* Enhanced Features */}
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { icon: Shield, text: "Licensed & Insured" },
                    { icon: Award, text: "30+ Years Experience" }
                  ].map((feature, index) => (
                    <motion.div 
                      key={feature.text}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ x: shouldReduceMotion ? 0 : 5 }}
                    >
                      <motion.div 
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600/20 rounded-lg flex items-center justify-center"
                        whileHover={{ 
                          backgroundColor: "rgba(34, 197, 94, 0.3)",
                          scale: shouldReduceMotion ? 1 : 1.1
                        }}
                      >
                        <feature.icon className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      </motion.div>
                      <span className="text-gray-200 font-medium text-sm sm:text-base">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Quick Links */}
            <motion.div
              variants={itemVariants}
            >
              <motion.h3 
                className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-green-400 flex items-center gap-2"
                whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
              >
                <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                Quick Links
              </motion.h3>
              <nav className="space-y-3 sm:space-y-4">
                {quickLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ x: shouldReduceMotion ? 0 : 8 }}
                  >
                    <Link
                      to={link.path}
                      className="flex items-center space-x-3 text-gray-300 hover:text-green-400 transition-all duration-200 group py-2"
                    >
                      <motion.div 
                        className="w-2 h-2 bg-gray-600 rounded-full group-hover:bg-green-400 transition-colors duration-200"
                        whileHover={{ scale: shouldReduceMotion ? 1 : 1.5 }}
                      />
                      <span className="text-base sm:text-lg group-hover:font-medium">{link.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Enhanced Customer Rating */}
              <motion.div 
                className="mt-6 sm:mt-8 p-3 sm:p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700"
                whileHover={{
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  scale: shouldReduceMotion ? 1 : 1.02,
                  transition: { type: "spring" as const, stiffness: 300 }
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        whileHover={{ 
                          scale: shouldReduceMotion ? 1 : 1.2,
                          rotate: shouldReduceMotion ? 0 : 360
                        }}
                      >
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  <span className="text-yellow-400 font-semibold text-sm sm:text-base">5.0</span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm italic">
                  "Outstanding service quality and reliability"
                </p>
                <p className="text-gray-400 text-xs mt-1">- Healthcare Facilities Review</p>
              </motion.div>
            </motion.div>

            {/* Enhanced Services */}
            <motion.div
              variants={itemVariants}
            >
              <motion.h3 
                className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-green-400 flex items-center gap-2"
                whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                Our Services
              </motion.h3>
              <ul className="space-y-2 sm:space-y-3">
                {services.map((service, index) => (
                  <motion.li
                    key={service}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ x: shouldReduceMotion ? 0 : 8 }}
                    className="text-gray-300 hover:text-green-400 transition-all duration-200 cursor-pointer group flex items-start gap-3"
                  >
                    <motion.div
                      whileHover={{ 
                        scale: shouldReduceMotion ? 1 : 1.2,
                        rotate: shouldReduceMotion ? 0 : 360
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-1 flex-shrink-0 group-hover:text-green-400" />
                    </motion.div>
                    <span className="group-hover:font-medium text-sm sm:text-base">{service}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Enhanced Contact Info */}
            <motion.div
              variants={itemVariants}
            >
              <motion.h3 
                className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-green-400 flex items-center gap-2"
                whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                Contact Info
              </motion.h3>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Enhanced Contact Details */}
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { icon: Phone, label: "Phone", value: "(0927) 178-3550", color: "text-green-400" },
                    { icon: Mail, label: "Email", value: "vpmed.ph@gmail.com", color: "text-green-400" },
                    { icon: Clock, label: "Hours", value: "Mon-Sat: 8AM-5PM", color: "text-green-400" },
                    { icon: MapPin, label: "Service", value: "Nationwide Coverage", color: "text-green-400" }
                  ].map((contact, index) => (
                    <motion.div 
                      key={contact.label}
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ 
                        x: shouldReduceMotion ? 0 : 5,
                        scale: shouldReduceMotion ? 1 : 1.02
                      }}
                    >
                      <motion.div 
                        className="bg-green-600/20 p-1.5 sm:p-2 rounded-lg"
                        whileHover={{
                          backgroundColor: "rgba(34, 197, 94, 0.3)",
                          scale: shouldReduceMotion ? 1 : 1.1
                        }}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          scale: { duration: 3, repeat: Infinity, delay: index * 0.5 }
                        }}
                      >
                        <contact.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${contact.color}`} />
                      </motion.div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm">{contact.label}</p>
                        <p className="text-white font-semibold text-sm sm:text-lg">{contact.value}</p>
                        {contact.label === "Hours" && (
                          <p className="text-gray-400 text-xs sm:text-sm">By Appointment</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Enhanced Social Media Links */}
                <motion.div 
                  className="pt-3 sm:pt-4 border-t border-slate-700"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <p className="text-gray-300 text-sm mb-3 sm:mb-4 font-medium">Connect With Us</p>
                  <div className="flex space-x-3 sm:space-x-4">
                    {[
                      { href: "https://facebook.com/VPMED22", icon: Facebook, bg: "hover:bg-blue-600" },
                      { href: "https://instagram.com/vpmed", icon: Instagram, bg: "hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500" },
                      { href: "mailto:vpmed.net@gmail.com", icon: MessageCircle, bg: "hover:bg-red-600" }
                    ].map((social, index) => (
                      <motion.a 
                        key={social.href}
                        href={social.href}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        whileHover={{ 
                          scale: shouldReduceMotion ? 1.02 : 1.1, 
                          y: shouldReduceMotion ? 0 : -2 
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-9 h-9 sm:w-10 sm:h-10 bg-slate-800 ${social.bg} rounded-lg flex items-center justify-center transition-all duration-300 group`}
                      >
                        <social.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white" />
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Bottom Bar */}
        <motion.div 
          className="border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 gap-4">
              
              {/* Enhanced Copyright */}
              <motion.div 
                className="text-gray-400 text-center md:text-left"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="flex items-center gap-2 text-sm sm:text-base">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                  </motion.div>
                  &copy; 2022 VPMED Medical Equipment Services. All rights reserved.
                </p>
              </motion.div>

        

              {/* Enhanced Back to Top */}
              <motion.button
                onClick={scrollToTop}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                whileHover={{ 
                  scale: shouldReduceMotion ? 1.02 : 1.1, 
                  y: shouldReduceMotion ? 0 : -3,
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.2)"
                }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center space-x-2 text-xs sm:text-sm bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 border border-green-600/30 group"
              >
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                </motion.div>
                <span>Back to Top</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Service Notice */}
        <motion.div 
          className="bg-gradient-to-r from-green-600 to-green-700 py-3 sm:py-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3"
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.01 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
              </motion.div>
              <p className="text-center text-xs sm:text-sm text-white font-medium">
                <strong>Service Notice:</strong> Professional medical equipment repair and maintenance services by appointment only. 
                Contact us to schedule your equipment service.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 
