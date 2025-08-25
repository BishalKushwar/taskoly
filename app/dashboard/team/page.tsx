"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserPlus, Crown, Shield, Eye, Search, Filter, Building2, Plus } from "lucide-react"
// Removed Supabase; using cookie-based auth and fetch
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { updateTeam, inviteTeamMember, updateMemberRole, removeTeamMember } from "@/lib/client-actions"
import CreateTeamDialog from "@/components/team/create-team-dialog"
import TeamInvitations from "@/components/team/team-invitations"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ProtectedRoute from "@/components/auth/protected-route"

interface TeamMember {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: "owner" | "admin" | "member" | "viewer"
  status: "active" | "pending" | "inactive"
  joined_at: string
}

interface Team {
  id: string
  name: string
  description?: string
  created_at: string
  subscription_tier: string
}

export default function TeamPage() {
  const { user } = useAuth()
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"member" | "admin" | "viewer">("member")
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [savingTeam, setSavingTeam] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchTeamData()
    }
  }, [user])

  const fetchTeamData = async () => {
    try {
      if (!user) return

      const res = await fetch("/api/team")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to load team")

      if (json.team) {
        setTeam(json.team)
        setEditingTeam(json.team)
        const formattedMembers = (json.members || []).map((member: any) => ({
          id: member.users?.id,
          email: member.users?.email,
          full_name: member.users?.full_name,
          avatar_url: member.users?.avatar_url,
          role: member.role,
          status: "active" as const,
          joined_at: member.joined_at,
        }))
        setMembers(formattedMembers)
      }
    } catch (error) {
      console.error("Error fetching team data:", error)
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTeamUpdate = async (formData: FormData) => {
    if (!team) return
    
    setSavingTeam(true)
    try {
      const name = formData.get("name") as string
      const description = formData.get("description") as string
      const avatar_url = formData.get("avatar_url") as string
      
      const result = await updateTeam(team.id, {
        name,
        description,
        avatar_url
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
          description: "Team updated successfully",
        })
        fetchTeamData() // Refresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive",
      })
    } finally {
      setSavingTeam(false)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail || !team) return

    try {
      const result = await inviteTeamMember(team.id, inviteEmail, inviteRole)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Invitation sent successfully",
        })
        setInviteEmail("")
        setInviteRole("member")
      }
    } catch (error) {
      console.error("Error inviting member:", error)
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      })
    }
  }

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    if (!team) return

    try {
      const result = await updateMemberRole(team.id, memberId, newRole)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Member role updated successfully",
        })
        fetchTeamData() // Refresh data
      }
    } catch (error) {
      console.error("Error updating member role:", error)
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return

    try {
      const result = await removeTeamMember(team.id, memberId)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Member removed successfully",
        })
        fetchTeamData() // Refresh data
      }
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />
      case "viewer":
        return <Eye className="w-4 h-4 text-gray-500" />
      default:
        return <Users className="w-4 h-4 text-green-500" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "viewer":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If user doesn't have a team, show create team option
  if (!team) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">No Team Yet?</h1>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create a team to start collaborating with your colleagues on projects, tasks, and more.
              </p>
              <CreateTeamDialog />
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Why Create a Team?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Collaborate with team members</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Manage projects together</span>
                </div>
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">Set roles and permissions</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <TeamInvitations />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600 mt-1">Manage your team members and permissions</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer - Can view projects</SelectItem>
                        <SelectItem value="member">Member - Can edit projects</SelectItem>
                        <SelectItem value="admin">Admin - Can manage team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleInviteMember} className="w-full">
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="members" className="space-y-6">
            <TabsList>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="settings">Team Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search members..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Members List */}
              <div className="grid gap-4">
                {filteredMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={member.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {member.full_name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("") || member.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">{member.full_name || member.email}</h3>
                                {getRoleIcon(member.role)}
                              </div>
                              <p className="text-sm text-gray-600">{member.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                                <Badge variant={member.status === "active" ? "default" : "secondary"}>
                                  {member.status}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {member.role !== "owner" && (
                            <div className="flex items-center space-x-2">
                              <Select value={member.role} onValueChange={(value) => handleUpdateMemberRole(member.id, value)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form action={handleTeamUpdate}>
                    <input type="hidden" name="teamId" value={team.id} />
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input
                          id="team-name"
                          name="name"
                          value={editingTeam?.name || ""}
                          onChange={(e) => setEditingTeam(editingTeam ? { ...editingTeam, name: e.target.value } : null)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="team-description">Description</Label>
                        <Textarea
                          id="team-description"
                          name="description"
                          value={editingTeam?.description || ""}
                          onChange={(e) => setEditingTeam(editingTeam ? { ...editingTeam, description: e.target.value } : null)}
                          placeholder="Tell us about your team..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Subscription Plan</Label>
                        <div className="mt-2">
                          <Badge className="bg-blue-100 text-blue-800">{team?.subscription_tier || "Free"} Plan</Badge>
                        </div>
                      </div>
                      <Button type="submit" disabled={savingTeam}>
                        {savingTeam ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
