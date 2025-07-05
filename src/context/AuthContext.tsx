import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  isAuthenticated: boolean
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

  useEffect(() => {
    let mounted = true

    // Function to handle session
    const handleSession = (session: Session | null) => {
      if (mounted) {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
        
        // Store session info in localStorage for debugging
        if (session) {
          localStorage.setItem('vpmed_auth_status', 'authenticated')
          localStorage.setItem('vpmed_user_email', session.user.email || '')
        } else {
          localStorage.removeItem('vpmed_auth_status')
          localStorage.removeItem('vpmed_user_email')
        }
      }
    }

    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        }
        handleSession(session)
      } catch (error) {
        console.error('Session retrieval error:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes with better handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.email)
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed for:', session?.user?.email)
      }
      
      handleSession(session)
    })

    // Cleanup function
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Sign in error:', error)
        return { error }
      }
      
      console.log('Sign in successful:', data.user?.email)
      return { error: null }
    } catch (error) {
      console.error('Sign in exception:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out user:', user?.email)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
      
      // Clear local storage
      localStorage.removeItem('vpmed_auth_status')
      localStorage.removeItem('vpmed_user_email')
      
      console.log('Sign out completed')
    } catch (error) {
      console.error('Sign out exception:', error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
    signIn,
    isAuthenticated: !!user && !!session
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 