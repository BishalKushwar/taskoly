'use client'

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import MessagingInterface from "@/components/messaging/messaging-interface"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/auth/protected-route"

export default function MessagesPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setDataLoading(true)
      
      // Fetch user's teams and projects for messaging
      const teamsRes = await fetch("/api/teams", { cache: "no-store" })
      const teamsJson = await teamsRes.json()
      const teamsData = (teamsJson.teams || []).map((t: any) => ({ team_id: t.id, role: t.role, teams: t }))

      const teamIds = teamsData.map((t: any) => t.team_id)
      const projectsRes = await fetch(`/api/projects?teamIds=${encodeURIComponent(teamIds.join(','))}`, { cache: "no-store" })
      const projectsJson = await projectsRes.json()
      const projectsData = projectsJson.projects || []

      setTeams(teamsData || [])
      setProjects(projectsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <MessagingInterface user={user} teams={teams} projects={projects} />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
