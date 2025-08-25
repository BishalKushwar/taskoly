'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
// Removed Supabase; not used with JWT cookie auth

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      router.push('/dashboard')
    }

    handleAuthCallback()
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Completing authentication...</p>
      </div>
    </div>
  )
}
