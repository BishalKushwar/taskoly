'use client'

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, Calendar, CheckCircle, Clock, TrendingUp, Target } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
// Removed Supabase; use our MongoDB-backed API endpoints
import ProtectedRoute from "@/components/auth/protected-route"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
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
      
      // Fetch user's teams
      const teamsRes = await fetch('/api/teams', { cache: 'no-store' })
      const teamsJson = await teamsRes.json()
      const teamsData = (teamsJson.teams || []).map((t: any) => ({ team_id: t.id, role: t.role, teams: t }))

      // Fetch projects for user's teams
      const teamIds = teamsData.map((t: any) => t.team_id)
      const projectsRes = await fetch(`/api/projects?teamIds=${encodeURIComponent(teamIds.join(','))}`, { cache: 'no-store' })
      const projectsJson = await projectsRes.json()
      const projectsData = projectsJson.projects || []

      // Fetch tasks for user's projects
      const projectIds = projectsData.map((p: any) => p.id)
      const tasksLists = await Promise.all(projectIds.map((pid: string) => fetch(`/api/tasks?projectId=${encodeURIComponent(pid)}`, { cache: 'no-store' }).then(r => r.json()).then(j => j.tasks || [])))
      const tasksData = tasksLists.flat()

      // Fetch team members
      const membersLists = await Promise.all(teamIds.map((tid: string) => fetch(`/api/team/members?teamId=${encodeURIComponent(tid)}`, { cache: 'no-store' }).then(r => r.json()).then(j => j.members || [])))
      const teamMembersData = membersLists.flat()

      setTeams(teamsData)
      setProjects(projectsData)
      setTasks(tasksData)
      setTeamMembers(teamMembersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Calculate analytics data
  const totalProjects = projects?.length || 0
  const activeProjects = projects?.filter((p) => p.status === "active").length || 0
  const completedProjects = projects?.filter((p) => p.status === "completed").length || 0

  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter((t) => t.status === "done").length || 0
  const inProgressTasks = tasks?.filter((t) => t.status === "in_progress").length || 0
  const pendingTasks = totalTasks - completedTasks - inProgressTasks

  const totalTeamMembers = teamMembers?.length || 0

  // Task completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Project status distribution
  const projectStatusData = [
    { name: "Active", value: activeProjects, color: "#10b981" },
    { name: "Completed", value: completedProjects, color: "#3b82f6" },
    { name: "Archived", value: totalProjects - activeProjects - completedProjects, color: "#6b7280" },
  ]

  // Task status distribution
  const taskStatusData = [
    { name: "Completed", value: completedTasks, color: "#10b981" },
    { name: "In Progress", value: inProgressTasks, color: "#3b82f6" },
    { name: "Pending", value: pendingTasks, color: "#f59e0b" },
  ]

  // Monthly task completion trend (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const month = date.toLocaleString("default", { month: "short" })
    
    const monthTasks = tasks?.filter((t) => {
      if (t.completed_at) {
        const taskDate = new Date(t.completed_at)
        return taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === date.getFullYear()
      }
      return false
    }) || []
    
    return {
      month,
      completed: monthTasks.length,
    }
  }).reverse()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {activeProjects} active, {completedProjects} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {completedTasks} completed, {pendingTasks} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTeamMembers}</div>
                <p className="text-xs text-muted-foreground">
                  Across {teams?.length || 0} teams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <Progress value={completionRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Overview of project statuses across your teams</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>Breakdown of task completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Task Completion Trend</CardTitle>
              <CardDescription>Task completion progress over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Task Priority Distribution</CardTitle>
              <CardDescription>Tasks grouped by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {tasks?.filter((t) => t.priority === "high").length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {tasks?.filter((t) => t.priority === "medium").length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Medium Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {tasks?.filter((t) => t.priority === "low").length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Low Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
