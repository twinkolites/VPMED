import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Enhanced environment variable validation
const validateEnvironmentVariables = () => {
  const errors = []
  
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is missing')
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://')
  }
  
  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing')
  } else if (supabaseAnonKey.length < 50) {
    errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)')
  }
  
  return errors
}

// Validate environment variables
const envErrors = validateEnvironmentVariables()
if (envErrors.length > 0) {
  console.error('Supabase configuration errors:', envErrors)
  // In production, log the error but don't crash the app
  if (import.meta.env.DEV) {
    throw new Error(`Supabase configuration error: ${envErrors.join(', ')}. Please check your environment variables.`)
  }
}

// Create Supabase client with production-optimized configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Production-optimized auth settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Custom storage with better error handling
    storage: {
      getItem: (key: string) => {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return null
        }
        try {
          return localStorage.getItem(key)
        } catch (error) {
          console.error('Error getting item from localStorage:', error)
          return null
        }
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return
        }
        try {
          localStorage.setItem(key, value)
        } catch (error) {
          console.error('Error setting item in localStorage:', error)
        }
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return
        }
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.error('Error removing item from localStorage:', error)
        }
      },
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'vpmed-dashboard',
    },
  },
  // Production database settings
  db: {
    schema: 'public',
  },
  // Production real-time settings
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Enhanced auth state change handler with better error handling
export const onAuthStateChange = (callback: (session: any) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    try {
      console.log('Supabase auth state change:', event, session?.user?.email)
      
      // Handle specific auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in successfully:', session?.user?.email)
          break
        case 'SIGNED_OUT':
          console.log('User signed out successfully')
          // Clear any cached data
          break
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed for user:', session?.user?.email)
          break
        case 'USER_UPDATED':
          console.log('User profile updated:', session?.user?.email)
          break
        case 'PASSWORD_RECOVERY':
          console.log('Password recovery initiated for:', session?.user?.email)
          break
        default:
          console.log('Auth event:', event)
      }
      
      callback(session)
    } catch (error) {
      console.error('Error in auth state change handler:', error)
      callback(null)
    }
  })
}

// Enhanced helper functions with better error handling
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
      throw error
    }
    
    // Clear additional stored data
    try {
      localStorage.removeItem('vpmed_auth_status')
      localStorage.removeItem('vpmed_user_email')
    } catch (storageError) {
      console.warn('Error clearing localStorage:', storageError)
    }
    
    return { error: null }
  } catch (error) {
    console.error('Sign out exception:', error)
    return { error }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Get user error:', error)
      return { user: null, error }
    }
    return { user: data.user, error: null }
  } catch (error) {
    console.error('Get user exception:', error)
    return { user: null, error }
  }
}

export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Get session error:', error)
      return { session: null, error }
    }
    return { session: data.session, error: null }
  } catch (error) {
    console.error('Get session exception:', error)
    return { session: null, error }
  }
}

export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('Refresh session error:', error)
      return { session: null, error }
    }
    return { session: data.session, error: null }
  } catch (error) {
    console.error('Refresh session exception:', error)
    return { session: null, error }
  }
}

// Production-optimized sign in function
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Sign in error:', error)
      return { user: null, session: null, error }
    }
    
    console.log('Sign in successful:', data.user?.email)
    return { user: data.user, session: data.session, error: null }
  } catch (error) {
    console.error('Sign in exception:', error)
    return { user: null, session: null, error }
  }
}

// Health check function for production monitoring
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase.from('gallery_items').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Supabase health check failed:', error)
      return { healthy: false, error }
    }
    
    return { healthy: true, error: null }
  } catch (error) {
    console.error('Supabase health check exception:', error)
    return { healthy: false, error }
  }
}

// Connection retry logic for production
export const retrySupabaseConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const health = await checkSupabaseHealth()
      if (health.healthy) {
        return { success: true, error: null }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    } catch (error) {
      console.error(`Supabase connection retry ${i + 1} failed:`, error)
      
      if (i === retries - 1) {
        return { success: false, error }
      }
    }
  }
  
  return { success: false, error: new Error('Max retries reached') }
} 