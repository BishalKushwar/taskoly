"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Users, Building2, Loader2 } from "lucide-react"
import { createTeam } from "@/lib/client-actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function CreateTeamDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    avatar_url: ""
  })
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a team",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Team name is required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const result = await createTeam({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        avatar_url: formData.avatar_url.trim() || undefined
      })
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: result.message || "Team created successfully",
        })
        setOpen(false)
        setFormData({ name: "", description: "", avatar_url: "" })
        // Refresh the page to show the new team
        router.refresh()
      }
    } catch (error) {
      console.error("Team creation error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!user) {
    return (
      <Button 
        onClick={() => router.push("/auth/login")}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        Login to Create Team
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Create New Team
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter team name"
                required
                className="mt-1"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Tell us about your team..."
                rows={3}
                className="mt-1"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="avatar_url">Avatar URL (Optional)</Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => handleInputChange("avatar_url", e.target.value)}
                placeholder="https://example.com/avatar.png"
                type="url"
                className="mt-1"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <Users className="w-4 h-4 text-blue-600" />
            <span>You'll be set as the team owner with full administrative privileges.</span>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                setFormData({ name: "", description: "", avatar_url: "" })
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
