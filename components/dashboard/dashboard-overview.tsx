"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  FolderKanban,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"

interface DashboardOverviewProps {
  user: any
  teams: any[]
  projects: any[]
  recentTasks: any[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function DashboardOverview({ user, teams, projects, recentTasks }: DashboardOverviewProps) {
  const completedTasks = recentTasks.filter((task) => task.status === "done").length
  const totalTasks = recentTasks.length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const activeProjects = projects.filter((p) => p.status === "active").length
  const totalTeams = teams.length

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Here's what's happening with your projects today.</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{activeProjects}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Team Members</CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{totalTeams * 5}</div>
            <p className="text-xs text-green-600 dark:text-green-400">Across {totalTeams} teams</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{completedTasks}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">{completionRate.toFixed(0)}% completion rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">+12%</div>
            <p className="text-xs text-orange-600 dark:text-orange-400">vs last week</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your most recently updated projects</CardDescription>
                </div>
                <Link href="/dashboard/projects">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 5).map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">{project.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {project.teams?.name} • {project.description?.slice(0, 50)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                      <Badge variant={project.priority === "high" ? "destructive" : "outline"}>
                        {project.priority}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions & Recent Activity */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Your latest task updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTasks.slice(0, 4).map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.status === "done"
                          ? "bg-green-500"
                          : task.status === "in_progress"
                            ? "bg-blue-500"
                            : task.priority === "high"
                              ? "bg-red-500"
                              : "bg-slate-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{task.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{task.projects?.name}</p>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Progress Overview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Your productivity metrics for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tasks Completed</span>
                  <span className="text-sm text-slate-500">
                    {completedTasks}/{totalTasks}
                  </span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Project Progress</span>
                  <span className="text-sm text-slate-500">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Team Collaboration</span>
                  <span className="text-sm text-slate-500">90%</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
