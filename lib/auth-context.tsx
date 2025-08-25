'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AuthUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, userData?: { full_name?: string; avatar_url?: string }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          setUser(json.user || null)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const json = await res.json()
        return { error: json.error || 'Login failed' }
      }
      // Refresh current user
      const me = await fetch('/api/auth/me', { cache: 'no-store' })
      const json = await me.json()
      setUser(json.user || null)
      return {}
    } catch (e: any) {
      return { error: e.message }
    }
  }

  const signUp = async (email: string, password: string, userData?: { full_name?: string; avatar_url?: string }) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...userData }),
      })
      if (!res.ok) {
        const json = await res.json()
        return { error: json.error || 'Signup failed' }
      }
      const me = await fetch('/api/auth/me', { cache: 'no-store' })
      const json = await me.json()
      setUser(json.user || null)
      return {}
    } catch (e: any) {
      return { error: e.message }
    }
  }

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  const value = { user, loading, signIn, signUp, signOut }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
