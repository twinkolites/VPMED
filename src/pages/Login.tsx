import React, { useState, useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import vpmedLogo from '../assets/images/vpmed.jpg'

const Login: React.FC = () => {
  const { user, loading, signIn, isAuthenticated } = useAuth()
  const [customAuth, setCustomAuth] = useState(true) // Default to custom form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Check for existing authentication status
  useEffect(() => {
    const authStatus = localStorage.getItem('vpmed_auth_status')
    const userEmail = localStorage.getItem('vpmed_user_email')
    
    if (authStatus === 'authenticated' && userEmail) {
      setSuccessMessage(`Welcome back! Checking credentials for ${userEmail}...`)
    }
  }, [])

  // Redirect if already authenticated
  if (!loading && (user || isAuthenticated)) {
    return <Navigate to="/dashboard" replace />
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      console.log('Attempting to sign in:', email)
      const { error } = await signIn(email, password)
      
      if (error) {
        throw error
      }
      
      setSuccessMessage('Login successful! Redirecting to dashboard...')
      
      // Give a moment for the success message to show
      setTimeout(() => {
        // The AuthContext will handle the redirect via the useEffect above
      }, 1000)
      
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setAuthLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Checking authentication status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo/Brand Section */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto h-24 w-24 mb-6"
          >
            <img 
              src={vpmedLogo} 
              alt="VPMED Logo" 
              className="h-24 w-24 rounded-2xl shadow-lg mx-auto object-cover"
            />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 text-3xl font-extrabold text-gray-800"
          >
            VPMED Admin Portal
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-2 flex items-center justify-center"
          >
            <LockClosedIcon className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-xs text-red-600 font-medium">Secure Login Only</span>
          </motion.div>
        </div>

        {/* Auth Toggle - Only show if we want both options */}
        {!customAuth && (
          <div className="flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={() => setCustomAuth(false)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !customAuth
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Quick Login
              </button>
              <button
                onClick={() => setCustomAuth(true)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  customAuth
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Admin Form
              </button>
            </div>
          </div>
        )}

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/40"
        >
          {!customAuth ? (
            <Auth
              supabaseClient={supabase}
              view="sign_in"
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#16a34a', // Green-600
                      brandAccent: '#15803d', // Green-700
                      brandButtonText: 'white',
                      defaultButtonBackground: 'rgba(239, 68, 68, 0.1)', // Red-50
                      defaultButtonBackgroundHover: 'rgba(239, 68, 68, 0.2)',
                      inputBackground: 'rgba(255, 255, 255, 0.9)',
                      inputBorder: 'rgba(34, 197, 94, 0.3)', // Green-500 opacity
                      inputBorderHover: 'rgba(34, 197, 94, 0.6)',
                      inputBorderFocus: '#16a34a',
                      inputText: '#374151',
                      inputLabelText: '#6b7280',
                      inputPlaceholder: '#9ca3af',
                    },
                    space: {
                      spaceSmall: '4px',
                      spaceMedium: '8px',
                      spaceLarge: '16px',
                      labelBottomMargin: '8px',
                      anchorBottomMargin: '4px',
                      emailInputSpacing: '4px',
                      socialAuthSpacing: '4px',
                      buttonPadding: '10px 15px',
                      inputPadding: '10px 15px',
                    },
                    fontSizes: {
                      baseBodySize: '13px',
                      baseInputSize: '14px',
                      baseLabelSize: '14px',
                      baseButtonSize: '14px',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '8px',
                      buttonBorderRadius: '8px',
                      inputBorderRadius: '8px',
                    },
                  },
                },
                className: {
                  container: 'space-y-4',
                  label: 'text-gray-700 text-sm font-medium',
                  button: 'w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
                  input: 'w-full bg-white/90 border-2 border-green-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200',
                  anchor: 'text-red-600 hover:text-red-700 text-sm font-medium',
                  divider: 'text-gray-400',
                  message: 'text-red-600 text-sm font-medium',
                },
              }}
              theme="light"
              providers={[]} // No social providers - admin only
              redirectTo={window.location.origin + '/dashboard'}
              showLinks={false} // Hide sign up links
            />
          ) : (
            <form onSubmit={handleAuth} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center"
                >
                  <LockClosedIcon className="h-4 w-4 mr-2 text-red-500" />
                  {error}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-green-700 text-sm flex items-center"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                  {successMessage}
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Administrator Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-2 border-green-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="admin@vpmed.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Administrator Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border-2 border-green-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pr-12"
                    placeholder="Enter secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2"
              >
                {authLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Verifying Administrator...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LockClosedIcon className="h-5 w-5 mr-2" />
                    Access Admin Portal
                  </div>
                )}
              </button>
            </form>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center space-y-2"
        >
          
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login 