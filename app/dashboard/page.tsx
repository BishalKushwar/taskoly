'use client'

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import DashboardOverview from "@/components/dashboard/dashboard-overview"
import { AIAssistant } from "@/components/ai/ai-assistant"
import { useAuth } from "@/lib/auth-context"
// Removed Supabase; use our MongoDB-backed API endpoints
import ProtectedRoute from "@/components/auth/protected-route"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [teams, setTeams] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setDataLoading(true)
      
      // Fetch overview data from API
      const res = await fetch("/api/dashboard/overview", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to load dashboard")
      setTeams((json.teams || []).map((t: any) => ({ team_id: t.id, role: t.role, teams: t })))
      setProjects(json.projects || [])
      setRecentTasks(json.recentTasks || [])
      setNotifications([])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardOverview user={user} teams={teams} projects={projects} recentTasks={recentTasks} />
        <AIAssistant />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
