import React, { createContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, ensureUserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  profileLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    // Get initial session and ensure profile
    const getInitialSession = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      const user = session?.user ?? null

      if (user) {
        setProfileLoading(true)
        try {
          await ensureUserProfile(user)
          setUser(user)
        } catch (error) {
          console.error('Error ensuring user profile:', error)
          // Still set user even if profile creation fails
          setUser(user)
        }
        setProfileLoading(false)
      } else {
        setUser(null)
      }

      setLoading(false)
    }

    getInitialSession()

    if (!supabase) {
      return
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        const user = session?.user ?? null

        if (user && event === 'SIGNED_IN') {
          setProfileLoading(true)
          try {
            await ensureUserProfile(user)
            setUser(user)
          } catch (error) {
            console.error('Error ensuring user profile:', error)
            setUser(user)
          }
          setProfileLoading(false)
        } else if (user) {
          // User already signed in, just set user
          setUser(user)
        } else {
          // No user, clear state
          setUser(null)
          setProfileLoading(false)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setSession(null)
    setProfileLoading(false)
  }

  const value = {
    user,
    session,
    loading: loading || profileLoading,
    profileLoading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

