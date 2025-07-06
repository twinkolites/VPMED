import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Menu, X, Phone, Mail, MapPin, ChevronRight, Sparkles, Zap, ShoppingBag } from 'lucide-react';
import vpmedLogo from '../../assets/images/vpmed.jpg';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = () => {
    // Scroll to top when navigating to a new page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Close mobile menu if open
    setIsMenuOpen(false);
  };

  const navigationItems = [
    { name: 'Home', path: '/', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'Services', path: '/services', icon: <Zap className="w-4 h-4" /> },
    { name: 'Gallery', path: '/gallery', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'Shop', path: '/shop', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'Contact', path: '/contact', icon: <Phone className="w-4 h-4" /> },
  ];

  // Enhanced Animation Variants
  const headerVariants: Variants = {
    initial: { y: -100, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
        duration: shouldReduceMotion ? 0.3 : 0.6
      }
    }
  };

  const mobileMenuVariants: Variants = {
    closed: { 
      x: '100%',
      opacity: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    open: { 
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const menuItemVariants: Variants = {
    closed: { opacity: 0, x: 20, scale: 0.9 },
    open: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <>
      <motion.header
        variants={headerVariants}
        initial="initial"
        animate="animate"
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? 'backdrop-blur-xl bg-white/90 shadow-xl border-b border-white/30' 
            : 'backdrop-blur-md bg-white/70'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Enhanced Premium Logo */}
            <motion.div
              whileHover={{ 
                scale: shouldReduceMotion ? 1.02 : 1.05,
                transition: { type: "spring" as const, stiffness: 300, damping: 15 }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { type: "spring" as const, stiffness: 400, damping: 20 }
              }}
              className="relative"
            >
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative">
                  <motion.img 
                    src={vpmedLogo} 
                    alt="VPMED Logo" 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shadow-lg object-cover"
                    whileHover={{ 
                      rotate: shouldReduceMotion ? 0 : [0, -5, 5, 0],
                      transition: { duration: 0.3 }
                    }}
                  />
                  <motion.div 
                    className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-black text-green-600">VPMED</span>
                  <div className="text-xs text-gray-500 font-medium hidden sm:block">PREMIUM SERVICES</div>
                </div>
              </Link>
            </motion.div>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.1, 
                    type: "spring", 
                    stiffness: 200,
                    damping: 20
                  }}
                  whileHover={{ 
                    y: shouldReduceMotion ? 0 : -2,
                    scale: shouldReduceMotion ? 1 : 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.path}
                    onClick={handleNavClick}
                    className={`flex items-center space-x-2 px-3 xl:px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      location.pathname === item.path
                        ? 'bg-green-600 text-white shadow-lg scale-105'
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <motion.div
                      animate={location.pathname === item.path ? {
                        rotate: [0, 360],
                        transition: { duration: 2, repeat: Infinity, ease: "linear" }
                      } : {}}
                    >
                      {item.icon}
                    </motion.div>
                    <span className="text-sm xl:text-base">{item.name}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Enhanced Premium CTA Button */}
            <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
              <Link to="/contact">
                                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    whileHover={{ 
                      scale: shouldReduceMotion ? 1.02 : 1.05, 
                      y: shouldReduceMotion ? 0 : -2,
                      boxShadow: "0 10px 25px rgba(34,197,94,0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                    <span className="relative flex items-center space-x-2 text-sm sm:text-base">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Get Quote</span>
                      <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.div>
                    </span>
                  </motion.button>
              </Link>
            </div>

            {/* Enhanced Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              whileHover={{ 
                scale: shouldReduceMotion ? 1.02 : 1.05,
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
              }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden lg:hidden p-2 sm:p-2.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-md border border-white/50 relative overflow-hidden"
              onClick={toggleMenu}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: 0, scale: 0 }}
                    animate={{ rotate: 180, scale: 1 }}
                    exit={{ rotate: 0, scale: 0 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    exit={{ rotate: 180, scale: 0 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <Menu className="w-5 h-5 text-gray-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Enhanced Premium Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden lg:hidden"
          >
            {/* Enhanced Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={toggleMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            {/* Enhanced Mobile Menu Panel */}
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="absolute right-0 top-0 h-full w-80 sm:w-96 bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/50"
            >
              <div className="p-4 sm:p-6 h-full flex flex-col">
                
                {/* Enhanced Menu Header */}
                <motion.div 
                  className="flex justify-between items-center mb-6 sm:mb-8 pt-2 sm:pt-4"
                  variants={menuItemVariants}
                >
                  <div className="flex items-center space-x-3">
                    <motion.img 
                      src={vpmedLogo} 
                      alt="VPMED Logo" 
                      className="w-8 h-8 rounded-lg object-cover"
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="text-lg font-black text-green-600">VPMED</span>
                  </div>
                  <motion.button 
                    onClick={toggleMenu}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </motion.div>

                {/* Enhanced Navigation */}
                <motion.nav 
                  className="flex-1 space-y-2 sm:space-y-3"
                  variants={mobileMenuVariants}
                >
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      variants={menuItemVariants}
                      whileHover={{ 
                        x: shouldReduceMotion ? 0 : 8,
                        scale: shouldReduceMotion ? 1 : 1.02,
                        transition: { type: "spring", stiffness: 300 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={item.path}
                        onClick={handleNavClick}
                        className={`flex items-center space-x-3 p-3 sm:p-4 rounded-xl font-medium transition-all duration-300 group ${
                          location.pathname === item.path
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                        }`}
                      >
                        <motion.div
                          animate={location.pathname === item.path ? {
                            rotate: [0, 360],
                            transition: { duration: 3, repeat: Infinity, ease: "linear" }
                          } : {}}
                          className="flex-shrink-0"
                        >
                          {item.icon}
                        </motion.div>
                        <span className="flex-1">{item.name}</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>

                {/* Enhanced Contact Section */}
                <motion.div 
                  className="mt-6 p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-green-50 rounded-xl border border-gray-200"
                  variants={menuItemVariants}
                >
                  <motion.h4 
                    className="font-bold text-gray-900 mb-4 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Phone className="w-4 h-4 text-green-600" />
                    </motion.div>
                    Contact Us
                  </motion.h4>
                  
                  <div className="space-y-3 text-sm text-gray-600 mb-4">
                    <motion.div 
                      className="flex items-center space-x-2"
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Phone className="w-4 h-4 text-green-600" />
                      <span className="font-medium">(0927) 178-3550</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center space-x-2"
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Mail className="w-4 h-4 text-green-600" />
                      <span>vpmed.ph@gmail.com</span>
                    </motion.div>
                  </div>
                  
                  <Link to="/contact">
                    <motion.button
                      whileHover={{ 
                        scale: shouldReduceMotion ? 1.01 : 1.02,
                        boxShadow: "0 5px 15px rgba(34,197,94,0.2)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-300 relative overflow-hidden group"
                      onClick={handleNavClick}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                          <Phone className="w-4 h-4" />
                        </motion.div>
                        Get Quote
                      </span>
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header; 