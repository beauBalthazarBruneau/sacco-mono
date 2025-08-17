import { createClient } from '@supabase/supabase-js'

// You'll need to replace these with your actual Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get auth status
export const getAuthStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error getting session:', error)
      return { isAuthenticated: false, user: null, error }
    }
    return { isAuthenticated: !!session, user: session?.user || null, error: null }
  } catch (error) {
    console.error('Error checking auth status:', error)
    return { isAuthenticated: false, user: null, error }
  }
}

// Helper function to sign in with magic link
export const signInWithMagicLink = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: chrome.runtime.getURL('popup.html')
      }
    })
    return { data, error }
  } catch (error) {
    console.error('Error signing in:', error)
    return { data: null, error }
  }
}

// Helper function to sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error('Error signing out:', error)
    return { error }
  }
}
