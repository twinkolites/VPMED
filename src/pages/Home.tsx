import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, useAnimation, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Clock, Star, CheckCircle, Phone, Mail, MapPin, Award, TrendingUp, Users, Sparkles, Wrench, Settings, Cog, Stethoscope, Activity, Hammer, Gauge, Eye } from 'lucide-react';
import { ParallaxSection, FloatingElement, GlassCard, HolographicText, InteractiveButton } from '../components/ParallaxSection';
import type { GalleryItem, GalleryImage } from '../types';
import { fetchGalleryItems } from '../lib/galleryApi';

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
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      duration: 0.6
    }
  }
};

const cardHoverVariants = {
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 15
    }
  }
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    rotate: [0, 2, -2, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Premium Statistics Counter Component with Enhanced Animation
const AnimatedCounter: React.FC<{ value: number; suffix?: string; prefix?: string }> = ({ value, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (inView) {
      const duration = shouldReduceMotion ? 1000 : 2000;
      const steps = shouldReduceMotion ? 30 : 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [inView, value, shouldReduceMotion]);

  return (
    <motion.span 
      ref={ref}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay: 0.2 
      }}
    >
      {prefix}{count}{suffix}
    </motion.span>
  );
};

// Enhanced 3D Floating Medical Icons with Better Mobile Animation
const FloatingMedicalIcon: React.FC<{ icon: React.ReactNode; delay: number; className?: string }> = ({ icon, delay, className = '' }) => (
  <motion.div
    className={className}
    animate={{
      y: [0, -10, 0],
      rotate: [0, 2, -2, 0],
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
    whileHover={{ 
      scale: 1.1, 
      rotate: 5,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    }}
    whileTap={{ scale: 0.95 }}
  >
    <motion.div 
      className="glass-effect p-3 sm:p-4 rounded-xl sm:rounded-2xl glow-green cursor-pointer"
      whileHover={{ 
        boxShadow: "0 10px 30px rgba(34, 197, 94, 0.3)",
        borderColor: "rgba(34, 197, 94, 0.5)"
      }}
    >
      <motion.div
        animate={{ 
          rotate: [0, 360],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        {icon}
      </motion.div>
    </motion.div>
  </motion.div>
);

// Helper function to render images based on type and category (copied from Gallery.tsx)
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
            <img 
              src={beforeImage.image_url} 
              alt={beforeImage.caption || `${item.title} - Before`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 relative">
            <img 
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
              <img 
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
      <img 
        src={mainImage.image_url} 
        alt={mainImage.caption || item.alt_text || item.title}
        className="w-full h-full object-cover"
      />
    );
  }

  // Fallback to icon if no images available
  return (
    <div className="text-4xl sm:text-6xl text-emerald-600/20">
      {item.category === 'before-after' && <Wrench />}
      {item.category === 'equipment' && <Settings />}
      {item.category === 'work-process' && <Activity />}
      {item.category === 'certifications' && <Award />}
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  const [featuredGalleryItems, setFeaturedGalleryItems] = useState<GalleryItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    const getFeaturedItems = async () => {
      setLoadingGallery(true);
      try {
        const items = await fetchGalleryItems();
        setFeaturedGalleryItems(items.slice(0, 3)); // Get only the first 3
      } catch (error) {
        console.error("Error fetching featured gallery items:", error);
      } finally {
        setLoadingGallery(false);
      }
    };
    getFeaturedItems();
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  // Enhanced parallax effects with mobile consideration
  const heroY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? -50 : -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, shouldReduceMotion ? 0.95 : 0.8]);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Enhanced Hero Section with Better Mobile Animations */}
      <motion.section 
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center pt-16 px-4"
      >
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-gray-50 to-green-100">
            <motion.div 
              className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.15),transparent_50%)]"
              animate={{
                background: [
                  "radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.15),transparent_50%)",
                  "radial-gradient(circle_at_70%_70%,rgba(34,197,94,0.15),transparent_50%)",
                  "radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.15),transparent_50%)"
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* Enhanced Floating Medical Tool Icons */}
        <FloatingMedicalIcon 
          delay={0} 
          className="absolute top-20 left-4 sm:left-20 opacity-60 sm:opacity-70"
          icon={<Wrench className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" />}
        />
        
        <FloatingMedicalIcon 
          delay={1} 
          className="absolute top-24 right-4 sm:top-32 sm:right-24 opacity-60 sm:opacity-70"
          icon={<Settings className="w-4 h-4 sm:w-7 sm:h-7 text-red-600" />}
        />
        
        <FloatingMedicalIcon 
          delay={2} 
          className="absolute bottom-32 left-4 sm:left-24 opacity-60 sm:opacity-70"
          icon={<Stethoscope className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" />}
        />
        
        <FloatingMedicalIcon 
          delay={1.5} 
          className="absolute top-40 right-8 sm:top-64 sm:right-16 opacity-60 sm:opacity-70"
          icon={<Cog className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />}
        />
        
        <FloatingMedicalIcon 
          delay={0.5} 
          className="absolute bottom-40 right-6 sm:bottom-48 sm:right-40 opacity-60 sm:opacity-70"
          icon={<Activity className="w-4 h-4 sm:w-7 sm:h-7 text-red-500" />}
        />
        
        <FloatingMedicalIcon 
          delay={2.5} 
          className="absolute top-60 left-2 sm:top-48 sm:left-12 opacity-60 sm:opacity-70"
          icon={<Gauge className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="mb-6 sm:mb-8"
            >
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight px-2"
                variants={itemVariants}
              >
                <motion.span
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                >
                  Medical Equipment
                </motion.span>
                <br />
                <motion.span 
                  className="text-green-600"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                >
                  Repair & Maintenance
                </motion.span>
              </motion.h1>
            </motion.div>

            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
              variants={itemVariants}
            >
              Trusted by hospitals, clinics, and healthcare facilities Nationwide. 
              We deliver excellence through cutting-edge technology and unmatched expertise.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <InteractiveButton size="lg" className="group w-full sm:w-auto" onClick={() => navigate('/contact')}>
                  <span className="flex items-center justify-center gap-3">
                    Get Quote
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  </span>
                </InteractiveButton>
              </motion.div>
            </motion.div>

            {/* Enhanced Trust Indicators with Stagger Animation */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8"
            >
              {[
                { value: 500, suffix: "+", label: "Total Services" },
                { value: 99, suffix: "%", label: "Uptime Guarantee" },
                { value: 30, suffix: "+", label: "Years Experience" }
              ].map((item, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <motion.div
                    className="text-center p-3 sm:p-4 bg-white/70 backdrop-blur-md rounded-xl border border-white/50 shadow-lg"
                    whileHover={{
                      y: -8,
                      scale: 1.02,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }
                    }}
                    whileTap={{
                      scale: 0.98,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 15
                      }
                    }}
                  >
                    <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1 sm:mb-2">
                      <AnimatedCounter value={item.value} suffix={item.suffix} />
                    </div>
                    <p className="text-slate-600 font-medium text-xs sm:text-sm">{item.label}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Services Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-20"
          >
            <motion.h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              Our <HolographicText>Premium</HolographicText> Services
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Comprehensive medical equipment services delivered by certified technicians
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                icon: <Wrench className="w-10 h-10 sm:w-12 sm:h-12" />,
                title: "Emergency Equipment Repair",
                description: "Critical 24-hour emergency repair services for life-support and essential medical equipment",
                gradient: "from-red-500 to-red-600",
                category: "repair"
              },
              {
                icon: <Shield className="w-10 h-10 sm:w-12 sm:h-12" />,
                title: "Safety & Compliance",
                description: "Industry and Joint Commission compliance testing ensuring your equipment meets all regulatory standards",
                gradient: "from-purple-500 to-purple-600",
                category: "inspection"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={cardHoverVariants.hover}
                whileTap={cardHoverVariants.tap}
                onClick={() => navigate('/services')}
              >
                <div className="h-full group cursor-pointer bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                  <motion.div 
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center text-white mb-4 sm:mb-6 mx-auto sm:mx-0`}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.3 }
                    }}
                  >
                    {service.icon}
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-800 text-center sm:text-left">{service.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base text-center sm:text-left">{service.description}</p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-2 sm:gap-0">
                    <motion.div 
                      className="flex items-center gap-2 text-emerald-600"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Standards Compliant</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-2 text-blue-600"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Fast Response</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center px-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <InteractiveButton onClick={() => navigate('/services')} size="lg" className="w-full sm:w-auto">
                <span className="flex items-center justify-center gap-3">
                  View All Services
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </InteractiveButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Gallery Preview Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-20"
          >
            <motion.h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
              initial={{ opacity: 0, rotateX: 90 }}
              whileInView={{ opacity: 1, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              Featured <HolographicText>Project</HolographicText> Gallery
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto px-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Real results from our expert medical equipment repair and maintenance services
            </motion.p>
          </motion.div>

          {loadingGallery ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-slate-200 animate-pulse"
                  style={{ minHeight: 340 }}
                >
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center relative overflow-hidden">
                    <div className="w-full h-full bg-gray-200" />
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
                    <div className="h-3 w-1/3 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-1/4 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {featuredGalleryItems.map((project, index) => {
                return (
              <motion.div
                key={project.id}
                variants={itemVariants}
                whileHover={{
                  y: -12,
                  rotateY: 5,
                  boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-slate-50 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden group border border-slate-200 hover:border-emerald-300 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/gallery?id=${project.id}`)}
              >
                {/* Enhanced Image Placeholder */}
                <motion.div 
                  className="h-40 sm:h-48 bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                      {renderItemImage(project)}
                </motion.div>

                {/* Enhanced Content */}
                <div className="p-4 sm:p-6">
                  <motion.div 
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                      {project.category.replace('-', ' ')}
                    </span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <Star 
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < project.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.h3 
                    className="text-lg sm:text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {project.title}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-slate-600 text-xs sm:text-sm mb-4 line-clamp-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {project.description}
                  </motion.p>

                  <motion.div 
                    className="space-y-2 text-xs text-slate-500 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-2">
                      <Cog className="w-3 h-3" />
                          <span className="truncate">{project.equipment_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{project.location}</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="p-2 sm:p-3 bg-white rounded-lg border border-slate-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    <p className="text-xs text-slate-600 italic">
                      "{project.testimonial}"
                    </p>
                  </motion.div>
                </div>
              </motion.div>
                )})}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center px-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <InteractiveButton onClick={() => navigate('/gallery')} variant="secondary" size="lg" className="w-full sm:w-auto">
                <span className="flex items-center justify-center gap-3">
                  <Eye className="w-5 h-5" />
                  View Complete Gallery
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </InteractiveButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Process Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-900 to-emerald-900 text-white relative overflow-hidden">
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
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-20"
          >
            <motion.h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              Our <HolographicText>Professional</HolographicText> Process
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto px-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              A systematic approach ensuring quality, transparency, and reliability in every service we provide
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              { 
                step: "01", 
                title: "Initial Assessment", 
                description: "Comprehensive evaluation of equipment condition, failure analysis, and diagnostic testing to identify root causes",
                icon: <Cog className="w-6 h-6 sm:w-8 sm:h-8" />
              },
              { 
                step: "02", 
                title: "Detailed Quote", 
                description: "Transparent pricing with detailed breakdown of labor, parts, and timeline. No hidden fees or surprise costs",
                icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />
              },
              { 
                step: "03", 
                title: "Expert Repair", 
                description: "Certified technicians perform repairs using OEM parts and manufacturer-approved procedures",
                icon: <Wrench className="w-6 h-6 sm:w-8 sm:h-8" />
              },
              { 
                step: "04", 
                title: "Quality Assurance", 
                description: "Comprehensive testing, calibration verification, and performance validation before equipment return",
                icon: <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
              }
            ].map((process, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  rotateY: 10,
                  boxShadow: "0 20px 40px rgba(16,185,129,0.2)",
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
                className="h-full"
              >
                <div className="relative text-center group bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 cursor-pointer flex flex-col justify-between h-full min-h-[340px]">
                  <motion.div 
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white"
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.1,
                      transition: { duration: 0.5 }
                    }}
                  >
                    {process.icon}
                  </motion.div>
                  <div className="flex-1 flex flex-col justify-between">
                  <motion.div 
                    className="text-2xl sm:text-3xl font-black gradient-text mb-2"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    {process.step}
                  </motion.div>
                  <motion.h3 
                    className="text-lg sm:text-xl font-bold mb-3 sm:mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {process.title}
                  </motion.h3>
                  <motion.p 
                    className="text-slate-300 leading-relaxed text-xs sm:text-sm"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {process.description}
                  </motion.p>
                  </div>
                  <motion.div 
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 w-2 h-2 bg-emerald-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-8 sm:mt-12 px-4"
          >
            <motion.p 
              className="text-emerald-300 font-medium text-sm sm:text-base"
              animate={{
                textShadow: [
                  "0 0 5px rgba(16,185,129,0.5)",
                  "0 0 10px rgba(16,185,129,0.8)",
                  "0 0 5px rgba(16,185,129,0.5)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Trusted by 500+ healthcare facilities nationwide
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <ParallaxSection speed={0.2} className="py-16 sm:py-24 bg-gradient-to-br from-emerald-50 to-slate-50">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <motion.div 
              className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50"
              whileHover={{
                boxShadow: "0 30px 60px rgba(0,0,0,0.1)",
                y: -10,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              <div className="p-6 sm:p-8">
                <motion.h2 
                  className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Ready for <HolographicText>Premium</HolographicText> Service?
                </motion.h2>
                <motion.p 
                  className="text-lg sm:text-xl text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Join hundreds of healthcare facilities that trust VPMED for their critical equipment maintenance needs.
                </motion.p>
                
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-6 sm:mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <InteractiveButton size="lg" onClick={() => navigate('/contact')} className="w-full sm:w-auto">
                      <span className="flex items-center justify-center gap-3">
                        <Phone className="w-5 h-5" />
                        Schedule Service
                      </span>
                    </InteractiveButton>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-500"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {[
                    "Appointment Only Service",
                    "Licensed & Insured", 
                    "30+ Years Combined Experience"
                  ].map((text, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center gap-2"
                      variants={itemVariants}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          delay: index * 0.5 
                        }}
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                      </motion.div>
                      <span>{text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </ParallaxSection>
    </div>
  );
};

export default Home; 
