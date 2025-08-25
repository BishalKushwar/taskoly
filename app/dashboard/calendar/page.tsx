'use client'

import { useEffect, useState } from "react"
import CalendarInterface from "@/components/calendar/calendar-interface"
import { useAuth } from "@/lib/auth-context"
// Removed Supabase; using Mongo-backed endpoints
import ProtectedRoute from "@/components/auth/protected-route"

export default function CalendarPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setDataLoading(true)
      
      // Fetch teams (for now, reuse /api/teams)
      const teamsRes = await fetch('/api/teams', { cache: 'no-store' })
      const teamsJson = await teamsRes.json()
      const teamsData = (teamsJson.teams || []).map((t: any) => t)

      // Fetch tasks - aggregate all projects from user's teams
      const projectRes = await fetch(`/api/projects?teamIds=${encodeURIComponent(teamsData.map((t:any)=>t.id).join(','))}`, { cache: 'no-store' })
      const projectJson = await projectRes.json()
      const allProjectIds = (projectJson.projects || []).map((p: any) => p.id)
      // naive: load tasks per project and merge
      const tasksLists = await Promise.all(
        allProjectIds.map((pid: string) => fetch(`/api/tasks?projectId=${encodeURIComponent(pid)}`, { cache: 'no-store' }).then(r => r.json()).then(j => j.tasks || []))
      )
      const tasksData = tasksLists.flat()

      // Members of the first team (for assignment views)
      const teamId = teamsData[0]?.id
      let membersData: any[] = []
      if (teamId) {
        const memRes = await fetch(`/api/team/members?teamId=${encodeURIComponent(teamId)}`, { cache: 'no-store' })
        const memJson = await memRes.json()
        membersData = memJson.members || []
      }

      setTeams(teamsData || [])
      setEvents([])
      setTasks(tasksData || [])
      setTeamMembers(membersData || [])
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
      <CalendarInterface
        user={user}
        teams={teams}
        events={events}
        tasks={tasks}
        teamMembers={teamMembers}
      />
    </ProtectedRoute>
  )
}
