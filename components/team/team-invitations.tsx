"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, Mail, Clock, Check, X } from "lucide-react"
// Removed Supabase; we use cookie-based auth and fetch
import { useToast } from "@/hooks/use-toast"

interface TeamInvitation {
  id: string
  team_id: string
  email: string
  role: string
  status: "pending" | "accepted" | "declined" | "expired"
  expires_at: string
  created_at: string
  teams: {
    name: string
    description?: string
    avatar_url?: string
  }
}

export default function TeamInvitations() {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  // no client sdk required

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      const res = await fetch("/api/team/invitations")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to load invitations")
      setInvitations(json.invitations || [])
    } catch (error) {
      console.error("Error fetching invitations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvitation = async (invitationId: string, action: "accept" | "decline") => {
    try {
      const response = await fetch("/api/team/invite", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteId: invitationId,
          action,
        }),
      })

      const result = await response.json()

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: result.message,
        })
        
        if (action === "accept") {
          // Refresh the page to show the new team
          window.location.reload()
        } else {
          // Remove the declined invitation from the list
          setInvitations(invitations.filter(inv => inv.id !== invitationId))
        }
      }
    } catch (error) {
      console.error("Error handling invitation:", error)
      toast({
        title: "Error",
        description: "Failed to process invitation",
        variant: "destructive",
      })
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (invitations.length === 0) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          Team Invitations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={invitation.teams.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  <Building2 className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{invitation.teams.name}</h3>
                <p className="text-sm text-gray-600">{invitation.teams.description || "No description"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{invitation.role}</Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {isExpired(invitation.expires_at) ? (
                      <span className="text-red-600">Expired</span>
                    ) : (
                      <span>Expires {new Date(invitation.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {!isExpired(invitation.expires_at) && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleInvitation(invitation.id, "accept")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleInvitation(invitation.id, "decline")}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}

            {isExpired(invitation.expires_at) && (
              <Badge variant="secondary" className="text-red-600">
                Expired
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
