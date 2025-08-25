import { NextResponse } from "next/server"
import { TeamInvitationModel } from "@/models/TeamInvitation"
import { TeamModel } from "@/models/Team"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const TeamInvitation = await TeamInvitationModel()
    const invitations = await TeamInvitation.find({ email: user.email, status: "pending" })
      .sort({ created_at: -1 })
      .lean()

    const teamIds = invitations.map((i: any) => i.team_id)
    const Team = await TeamModel()
    const teams = await Team.find({ id: { $in: teamIds } }, { id: 1, name: 1, description: 1, avatar_url: 1 }).lean()
    const teamMap = new Map(teams.map((t: any) => [t.id, t]))

    const result = invitations.map((inv: any) => ({
      id: inv._id,
      team_id: inv.team_id,
      email: inv.email,
      role: inv.role,
      status: inv.status,
      expires_at: inv.expires_at,
      created_at: inv.created_at,
      teams: teamMap.get(inv.team_id) || null,
    }))

    return NextResponse.json({ invitations: result })
  } catch (error: any) {
    console.error("Invitations fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


