'use client'

import { createContext, useContext, useState } from 'react'

interface AuthUser {
  id: string
  email: string
  name?: string
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
  const [loading, setLoading] = useState(false)

  const signIn = async (email: string, password: string) => {
    setLoading(true)
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

      const json = await res.json()
      setUser(json.user)
      return {}
    } catch (e: any) {
      return { error: e.message }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData?: { full_name?: string; avatar_url?: string }) => {
    setLoading(true)
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

      const json = await res.json()
      setUser(json.user)
      return {}
    } catch (e: any) {
      return { error: e.message }
    } finally {
      setLoading(false)
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
