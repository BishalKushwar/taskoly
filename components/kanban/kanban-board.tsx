"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
// Removed Supabase realtime; future enhancement could add websockets
import TaskCard from "./task-card"
import CreateTaskDialog from "./create-task-dialog"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  assigned_to?: string
  due_date?: string
  position: number
  created_at: string
  assigned_user?: {
    id: string
    full_name: string
    avatar_url?: string
    email: string
  }
  created_by_user?: {
    id: string
    full_name: string
    avatar_url?: string
    email: string
  }
}

interface KanbanBoardProps {
  project: any
  tasks: Task[]
  teamMembers: any[]
  currentUser: any
  userRole: string
}

const columns = [
  { id: "todo", title: "To Do", color: "bg-slate-100 dark:bg-slate-800" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "review", title: "Review", color: "bg-yellow-50 dark:bg-yellow-900/20" },
  { id: "done", title: "Done", color: "bg-green-50 dark:bg-green-900/20" },
]

export default function KanbanBoard({
  project,
  tasks: initialTasks,
  teamMembers,
  currentUser,
  userRole,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAssignee, setFilterAssignee] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")

  // Real-time updates removed for now
  useEffect(() => {}, [project.id])

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const task = tasks.find((t) => t.id === draggableId)
    if (!task) return

    // Update task status and position
    const newStatus = destination.droppableId
    const newPosition = destination.index

    // Optimistically update the UI
    setTasks((prev) => prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus, position: newPosition } : t)))

    // Update in database
    const res = await fetch("/api/tasks", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: draggableId, updates: { status: newStatus, position: newPosition, ...(newStatus === "done" ? { completed_at: new Date().toISOString() } : {}) } }) })

    if (!res.ok) {
      const json = await res.json()
      console.error("Error updating task:", json)
      // Revert optimistic update on error
      setTasks(initialTasks)
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter((task) => {
        const matchesStatus = task.status === status
        const matchesSearch =
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesAssignee = filterAssignee === "all" || task.assigned_to === filterAssignee
        const matchesPriority = filterPriority === "all" || task.priority === filterPriority

        return matchesStatus && matchesSearch && matchesAssignee && matchesPriority
      })
      .sort((a, b) => a.position - b.position)
  }

  const handleCreateTask = (columnId: string) => {
    setSelectedColumn(columnId)
    setIsCreateDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {project.teams?.name} • {tasks.length} tasks
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => handleCreateTask("todo")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.users.id} value={member.users.id}>
                    {member.users.full_name || member.users.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <Card key={column.id} className={`${column.color} border-2`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">{column.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {getTasksByStatus(column.id).length}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCreateTask(column.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? "bg-blue-50 dark:bg-blue-900/10" : ""
                      }`}
                    >
                      <AnimatePresence>
                        {getTasksByStatus(column.id).map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`${snapshot.isDragging ? "rotate-3 scale-105" : ""} transition-transform`}
                              >
                                <TaskCard
                                  task={task}
                                  teamMembers={teamMembers}
                                  currentUser={currentUser}
                                  projectId={project.id}
                                />
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        projectId={project.id}
        teamId={project.team_id}
        initialStatus={selectedColumn || "todo"}
        teamMembers={teamMembers}
        currentUser={currentUser}
      />
    </div>
  )
}
