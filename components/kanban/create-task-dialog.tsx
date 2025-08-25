"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
// Removed Supabase; use our MongoDB-backed API endpoints

interface CreateTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  teamId: string
  initialStatus: string
  teamMembers: any[]
  currentUser: any
}

export default function CreateTaskDialog({
  isOpen,
  onClose,
  projectId,
  teamId,
  initialStatus,
  teamMembers,
  currentUser,
}: CreateTaskDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigned_to: "unassigned",
    due_date: undefined as Date | undefined,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsLoading(true)

    const taskData = {
      title: formData.title,
      description: formData.description || null,
      status: initialStatus,
      priority: formData.priority,
      assigned_to: formData.assigned_to === "unassigned" ? null : formData.assigned_to,
      due_date: formData.due_date?.toISOString() || null,
      project_id: projectId,
      created_by: currentUser.id,
      position: 0, // Will be handled by the database
    }

    const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(taskData) })
    if (res.ok) {
      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        assigned_to: "unassigned",
        due_date: undefined,
      })
      onClose()
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to your project board.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assign to</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, assigned_to: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.users.id} value={member.users.id}>
                      {member.users.full_name || member.users.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? format(formData.due_date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => setFormData((prev) => ({ ...prev, due_date: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
