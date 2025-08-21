import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '../config/supabase'

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disabled for Chrome extension
    storage: {
      getItem: (key) => {
        return new Promise((resolve) => {
          chrome.storage.local.get([key], (result) => {
            resolve(result[key] || null)
          })
        })
      },
      setItem: (key, value) => {
        return new Promise((resolve) => {
          chrome.storage.local.set({ [key]: value }, resolve)
        })
      },
      removeItem: (key) => {
        return new Promise((resolve) => {
          chrome.storage.local.remove([key], resolve)
        })
      }
    }
  }
})

// Auth helper functions
export const signInWithMagicLink = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: chrome.runtime.getURL('sidepanel.html')
      }
    })
    return { data, error }
  } catch (error) {
    console.error('Error in signInWithMagicLink:', error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error('Error in signOut:', error)
    return { error }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return { user: null, error }
  }
}

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  } catch (error) {
    console.error('Error in getSession:', error)
    return { session: null, error }
  }
}
