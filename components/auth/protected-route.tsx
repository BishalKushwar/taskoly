'use client'

import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    redirect("/auth/login")
  }

  return <>{children}</>
}
