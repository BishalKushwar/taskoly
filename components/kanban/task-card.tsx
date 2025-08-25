"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Flag, MoreVertical, Edit, Trash2, MessageSquare, Paperclip, Clock, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
// Removed Supabase; use our MongoDB-backed API endpoints

interface TaskCardProps {
  task: any
  teamMembers: any[]
  currentUser: any
  projectId: string
}

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}

const statusColors = {
  todo: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  done: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
}

export default function TaskCard({ task, teamMembers, currentUser, projectId }: TaskCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await fetch(`/api/tasks?id=${encodeURIComponent(task.id)}`, { method: "DELETE" })
    setIsDeleting(false)
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done"

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            isOverdue ? "border-red-200 dark:border-red-800" : ""
          }`}
          onClick={() => setIsDetailOpen(true)}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-slate-900 dark:text-white line-clamp-2">{task.title}</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} disabled={isDeleting}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{task.description}</p>
              )}

              {/* Priority and Status */}
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                  <Flag className="h-3 w-3 mr-1" />
                  {task.priority}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>

              {/* Due Date */}
              {task.due_date && (
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                {/* Assignee */}
                {task.assigned_user ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={task.assigned_user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {task.assigned_user.full_name?.charAt(0) || task.assigned_user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {task.assigned_user.full_name || task.assigned_user.email}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <User className="h-4 w-4" />
                    <span className="text-xs">Unassigned</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Paperclip className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Task Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{task.title}</DialogTitle>
            <DialogDescription>
              Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })} by{" "}
              {task.created_by_user?.full_name || task.created_by_user?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {task.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-slate-600 dark:text-slate-400">{task.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                  {task.status.replace("_", " ")}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Priority</h4>
                <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                  <Flag className="h-3 w-3 mr-1" />
                  {task.priority}
                </Badge>
              </div>
              {task.assigned_user && (
                <div>
                  <h4 className="font-medium mb-2">Assigned to</h4>
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={task.assigned_user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {task.assigned_user.full_name?.charAt(0) || task.assigned_user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{task.assigned_user.full_name || task.assigned_user.email}</span>
                  </div>
                </div>
              )}
              {task.due_date && (
                <div>
                  <h4 className="font-medium mb-2">Due Date</h4>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
