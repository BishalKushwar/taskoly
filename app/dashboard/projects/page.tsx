'use client'

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { useAuth } from "@/lib/auth-context"
import ProtectedRoute from "@/components/auth/protected-route"

export default function ProjectsPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [taskCounts, setTaskCounts] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setDataLoading(true)
      
      // Teams
      const teamsRes = await fetch("/api/teams", { cache: "no-store" })
      const teamsJson = await teamsRes.json()
      const teamsData = (teamsJson.teams || []).map((t: any) => ({ team_id: t.id, role: t.role, teams: t }))

      // Projects
      const teamIds = teamsData.map((t: any) => t.team_id)
      const projectsRes = await fetch(`/api/projects?teamIds=${encodeURIComponent(teamIds.join(','))}`, { cache: "no-store" })
      const projectsJson = await projectsRes.json()
      const projectsData = projectsJson.projects || []

      // Task counts
      const projectIds = projectsData.map((p: any) => p.id)
      const countsRes = await fetch(`/api/tasks/counts?projectIds=${encodeURIComponent(projectIds.join(','))}`, { cache: "no-store" })
      const countsJson = await countsRes.json()
      const taskCountsData = countsJson.counts || []

      setTeams(teamsData)
      setProjects(projectsData)
      setTaskCounts(taskCountsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // Calculate task statistics for each project
  const projectStats = projects?.map((project) => {
    const projectTasks = taskCounts?.filter((t) => t.project_id === project.id) || []
    const totalTasks = projectTasks.length
    const completedTasks = projectTasks.filter((t) => t.status === "done").length
    const inProgressTasks = projectTasks.filter((t) => t.status === "in_progress").length

    return {
      ...project,
      stats: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        pending: totalTasks - completedTasks - inProgressTasks,
      },
    }
  })

  if (dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-1">Manage your team's projects and track progress</p>
            </div>
            <CreateProjectDialog teams={teams} />
          </div>

          {/* Projects Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projectStats?.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-500">Team:</span>
                      <span className="text-xs text-gray-700">{project.teams.name}</span>
                    </div>
                  </div>
                </div>

                {/* Project Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Tasks:</span>
                    <span className="font-medium">{project.stats.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Completed:</span>
                    <span className="font-medium text-green-600">{project.stats.completed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">In Progress:</span>
                    <span className="font-medium text-blue-600">{project.stats.inProgress}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pending:</span>
                    <span className="font-medium text-orange-600">{project.stats.pending}</span>
                  </div>
                </div>

                {/* Project Status */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === "active"
                          ? "bg-green-100 text-green-800"
                          : project.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">Priority:</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : project.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {project.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!projectStats || projectStats.length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first project</p>
              <CreateProjectDialog teams={teams} />
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
