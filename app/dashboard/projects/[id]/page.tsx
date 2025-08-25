'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import KanbanBoard from "@/components/kanban/kanban-board"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/auth/protected-route"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string>("")
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (user && params.id) {
      fetchData()
    }
  }, [user, params.id])

  const fetchData = async () => {
    try {
      setDataLoading(true)
      
      // Fetch project details
      const projectRes = await fetch(`/api/projects/${params.id}`, { cache: "no-store" })
      const projectJson = await projectRes.json()
      const projectData = projectJson.project

      if (!projectData) {
        router.push("/dashboard")
        return
      }

      setProject(projectData)

      // Check if user has access to this project via team (server ensures, but we keep role)
      // Fetch team membership list to derive role
      const membersRes = await fetch(`/api/team/members?teamId=${encodeURIComponent(projectData.team_id)}`, { cache: "no-store" })
      const membersJson = await membersRes.json()
      const teamMemberData = (membersJson.members || []).find((m: any) => m.users?.id === user?.id)

      if (!teamMemberData) {
        router.push("/dashboard")
        return
      }

      setUserRole(teamMemberData?.role || "member")

      // Fetch tasks for this project
      const tasksRes = await fetch(`/api/tasks?projectId=${encodeURIComponent(params.id)}`, { cache: "no-store" })
      const tasksJson = await tasksRes.json()
      const tasksData = tasksJson.tasks || []

      // Fetch team members for assignment
      const teamMembersData = (membersJson.members || []).map((m: any) => ({
        user_id: m.users?.id,
        role: m.role,
        users: m.users,
      }))

      setTasks(tasksData || [])
      setTeamMembers(teamMembersData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      router.push("/dashboard")
    } finally {
      setDataLoading(false)
    }
  }

  if (dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!project) {
    return <div className="flex items-center justify-center min-h-screen">Project not found</div>
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <KanbanBoard
          project={project}
          tasks={tasks}
          teamMembers={teamMembers}
          currentUser={user}
          userRole={userRole}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
