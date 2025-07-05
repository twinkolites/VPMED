import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key: string) => {
        if (typeof localStorage === 'undefined') {
          return null
        }
        try {
          return localStorage.getItem(key)
        } catch (error) {
          console.error('Error getting item from storage:', error)
          return null
        }
      },
      setItem: (key: string, value: string) => {
        if (typeof localStorage === 'undefined') {
          return
        }
        try {
          localStorage.setItem(key, value)
        } catch (error) {
          console.error('Error setting item in storage:', error)
        }
      },
      removeItem: (key: string) => {
        if (typeof localStorage === 'undefined') {
          return
        }
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.error('Error removing item from storage:', error)
        }
      },
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'vpmed-dashboard',
    },
  },
})

// Enhanced auth state change handler
export const onAuthStateChange = (callback: (session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth state change:', event, session?.user?.email)
    callback(session)
  })
}

// Helper functions with better error handling
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
      throw error
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