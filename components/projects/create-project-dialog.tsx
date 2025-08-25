"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
// Removed Supabase; use our MongoDB-backed API endpoints

interface CreateProjectDialogProps {
  teams: any[]
}

export function CreateProjectDialog({ teams }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    team_id: "",
    due_date: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/projects/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, status: "Not Started", progress: 0 }) })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Failed to create project")
      }

      setOpen(false)
      // Optionally refresh the page or update the projects list
      window.location.reload()
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            placeholder="Project Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <Select
            value={formData.team_id}
            onValueChange={(value) => setFormData({ ...formData, team_id: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              {teams?.map((team) => (
                <SelectItem key={team.team_id} value={team.team_id}>
                  {team.teams.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}