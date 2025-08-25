"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
// Removed Supabase; use our MongoDB-backed API endpoints
import { UserPlus } from "lucide-react"

interface TeamInviteProps {
  teamId: string
}

export function TeamInvite({ teamId }: TeamInviteProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"member" | "admin" | "viewer">("member")
  const { toast } = useToast()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/team/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamId, email, role }) })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Failed to send invitation")
      }

      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${email}`,
      })

      setEmail("")
      setRole("member")
      setOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Invitation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}