import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  Send, 
  CheckCircle, 
  Shield, 
  Users, 
  Award,
  Stethoscope,
  Activity,
  Heart,
  Facebook,
  Instagram,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    equipment: '',
    service: '',
    message: '',
    urgency: 'routine'
  });

  const [submitted, setSubmitted] = useState(false);
  const [productInquiry, setProductInquiry] = useState<any>(null);

  // Check for product inquiry from Shop page
  useEffect(() => {
    const inquiryData = sessionStorage.getItem('inquiryProduct');
    if (inquiryData) {
      const product = JSON.parse(inquiryData);
      setProductInquiry(product);
      
      // Pre-fill form with product information
      setFormData(prev => ({
        ...prev,
        equipment: `${product.brand || ''} ${product.name || ''}`.trim(),
        service: 'equipment-inquiry',
        message: `I'm interested in the ${product.name} (${product.brand || 'Brand'} ${product.model || ''}) listed at ${product.price ? `₱${product.price.toLocaleString()}` : 'Contact for price'}. Please provide more details about availability, condition, and viewing arrangements.`
      }));
      
      // Clear the session storage
      sessionStorage.removeItem('inquiryProduct');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section - Matching Services Page */}
      <section className="relative py-24 bg-gradient-to-br from-slate-900 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_70%)]"></div>
        
        {/* Floating Service Icons */}
        <div className="absolute top-20 left-20 hidden lg:block opacity-30">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Stethoscope className="w-8 h-8 text-green-400" />
          </motion.div>
        </div>
        <div className="absolute top-32 right-24 hidden lg:block opacity-30">
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Activity className="w-6 h-6 text-red-400" />
          </motion.div>
        </div>
        <div className="absolute bottom-32 left-24 hidden lg:block opacity-30">
          <motion.div
            animate={{ y: [-8, 12, -8] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          >
            <Heart className="w-7 h-7 text-red-400" />
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
              Contact <span className="bg-gradient-to-r from-green-400 to-red-400 bg-clip-text text-transparent">Medical Equipment</span> Experts
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Get professional repair, maintenance, and compliance services for your healthcare facility. 
              Quality service and reliable support for all your medical equipment needs.
            </p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">Service</div>
                <div className="text-sm text-gray-400">By Appointment</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">Quality</div>
                <div className="text-sm text-gray-400">Guaranteed Work</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">OEM</div>
                <div className="text-sm text-gray-400">Certified Parts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">15+</div>
                <div className="text-sm text-gray-400">Years Experience</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Primary Contact - Facebook */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-12 border border-blue-100">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Facebook className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Get In Touch via <span className="text-blue-600">Facebook</span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                For the fastest response and immediate assistance with your medical equipment needs, 
                message us directly on Facebook. Our team responds quickly to all inquiries.
              </p>

              <motion.a
                href="https://facebook.com/VPMED22"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Facebook className="w-7 h-7" />
                Message Us on Facebook
                <ArrowRight className="w-6 h-6" />
              </motion.a>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Instant Response</h4>
                  <p className="text-sm text-gray-600">Quick replies during business hours</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Direct Communication</h4>
                  <p className="text-sm text-gray-600">Speak directly with our technicians</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Easy Scheduling</h4>
                  <p className="text-sm text-gray-600">Book appointments instantly</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Secondary Contact - Request Service Form */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Alternative: Request Service Form
            </h2>
            <p className="text-lg text-gray-600">
              Prefer to use a form? Fill out the details below and we'll get back to you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Service Request Details</h3>
              <p className="text-gray-600 mb-8">
                Complete the form below for detailed service requests and quotes.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Healthcare Facility
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      placeholder="Hospital/Clinic name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Type
                    </label>
                    <input
                      type="text"
                      name="equipment"
                      value={formData.equipment}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      placeholder="e.g., X-Ray, Ventilator, MRI"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Priority
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    >
                      <option value="routine">Routine Service</option>
                      <option value="urgent">Urgent Repair</option>
                      <option value="priority">Priority Service</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Needed
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  >
                    <option value="">Select a service</option>
                    <option value="equipment-inquiry">Equipment Purchase Inquiry</option>
                    <option value="equipment-repair">Equipment Repair</option>
                    <option value="preventive-maintenance">Preventive Maintenance</option>
                    <option value="safety-inspection">Safety Inspection</option>
                    <option value="compliance-testing">Compliance Testing</option>
                    <option value="calibration">Calibration Services</option>
                    <option value="parts-replacement">Parts Replacement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none"
                    placeholder="Describe your equipment issue or service requirements..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {submitted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Request Submitted!
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Request
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Additional Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="space-y-8"
            >
              {/* Other Contact Methods */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Other Contact Methods</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                      <p className="text-gray-600">For urgent matters only</p>
                      <p className="text-lg font-semibold text-green-600">09271783550</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Business Hours</h4>
                      <div className="text-gray-600 space-y-1">
                        <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                        <p>Saturday: 9:00 AM - 2:00 PM</p>
                        <p>Sunday: Closed</p>
                        <p className="text-green-600 font-medium">Service by Appointment</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Service Area</h4>
                      <p className="text-gray-600">
                        Regional coverage with local technicians<br />
                        Pickup & delivery available
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Choose VPMED */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Why Choose VPMED?</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Licensed & Insured Service</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">OEM Parts & Warranties</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Certified Technicians</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">30+ Years Experience</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact; 
