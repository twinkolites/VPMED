import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, signInWithEmail, checkSupabaseHealth, retrySupabaseConnection } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  isAuthenticated: boolean
  retryConnection: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Handle session updates
  const handleSession = useCallback((session: Session | null) => {
    setSession(session)
    setUser(session?.user ?? null)
    setLoading(false)
    setError(null)
    
    // Store session info in localStorage for debugging
    if (session) {
      try {
        localStorage.setItem('vpmed_auth_status', 'authenticated')
        localStorage.setItem('vpmed_user_email', session.user.email || '')
      } catch (error) {
        console.warn('Error storing auth status:', error)
      }
    } else {
      try {
        localStorage.removeItem('vpmed_auth_status')
        localStorage.removeItem('vpmed_user_email')
      } catch (error) {
        console.warn('Error clearing auth status:', error)
      }
    }
  }, [])

  // Handle auth errors
  const handleAuthError = useCallback((error: any) => {
    console.error('Auth error:', error)
    setError(error?.message || 'Authentication error occurred')
    setLoading(false)
  }, [])

  // Retry connection function
  const retryConnection = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await retrySupabaseConnection()
      if (result.success) {
        // Re-initialize session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          handleAuthError(error)
        } else {
          handleSession(session)
        }
      } else {
        handleAuthError(result.error)
      }
    } catch (error) {
      handleAuthError(error)
    }
  }, [handleSession, handleAuthError])

  // Initialize auth state
  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        // Check Supabase health first
        const health = await checkSupabaseHealth()
        if (!health.healthy) {
          if (mounted) {
            setError('Unable to connect to database. Please try again.')
            setLoading(false)
          }
          return
        }

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            handleAuthError(error)
          }
        } else {
          if (mounted) {
            handleSession(session)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          handleAuthError(error)
        }
      }
    }

    // Add a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        setError('Authentication is taking too long. Please refresh the page.')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      try {
        console.log('Auth state changed:', event, session?.user?.email)
        
        // Handle specific auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in successfully:', session?.user?.email)
            break
          case 'SIGNED_OUT':
            console.log('User signed out successfully')
            break
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed for user:', session?.user?.email)
            break
          case 'USER_UPDATED':
            console.log('User profile updated:', session?.user?.email)
            break
          default:
            console.log('Auth event:', event)
        }
        
        handleSession(session)
      } catch (error) {
        console.error('Error in auth state change handler:', error)
        handleAuthError(error)
      }
    })

    // Cleanup function
    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [handleSession, handleAuthError, loading])

  // Sign in function
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
      const { user, session, error } = await signInWithEmail(email, password)
      
      if (error) {
        console.error('Sign in error:', error)
        setError((error as any)?.message || 'Sign in failed')
        return { error }
      }
      
      console.log('Sign in successful:', user?.email)
      return { error: null }
    } catch (error: any) {
      console.error('Sign in exception:', error)
      setError('Sign in failed. Please try again.')
      return { error }
    }
  }, [])

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setError(null)
      console.log('Signing out user:', user?.email)
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        setError(error?.message || 'Sign out failed')
      }
      
      // Clear local storage
      try {
        localStorage.removeItem('vpmed_auth_status')
        localStorage.removeItem('vpmed_user_email')
      } catch (storageError) {
        console.warn('Error clearing localStorage:', storageError)
      }
      
      console.log('Sign out completed')
    } catch (error: any) {
      console.error('Sign out exception:', error)
      setError('Sign out failed. Please try again.')
    }
  }, [user])

  const value = {
    user,
    session,
    loading,
    error,
    signOut,
    signIn,
    isAuthenticated: !!user && !!session,
    retryConnection
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 