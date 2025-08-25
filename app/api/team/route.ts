import { NextResponse } from "next/server"
import { UserModel } from "@/models/User"
import { TeamModel } from "@/models/Team"
import { TeamMemberModel } from "@/models/TeamMember"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

// GET /api/team -> current user's team with members
export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const User = await UserModel()
    const profile = await User.findOne({ id: user.id }).lean()
    if (!profile?.team_id) {
      return NextResponse.json({ team: null, members: [] })
    }
    const Team = await TeamModel()
    const team = await Team.findOne({ id: profile.team_id }).lean()
    const TeamMember = await TeamMemberModel()
    const memberships = await TeamMember.find({ team_id: profile.team_id }).lean()
    const userIds = memberships.map((m: any) => m.user_id)
    const users = await User.find({ id: { $in: userIds } }, { id: 1, email: 1, full_name: 1, avatar_url: 1 }).lean()
    const userMap = new Map(users.map((u: any) => [u.id, u]))
    const members = memberships.map((m: any) => ({ ...m, users: userMap.get(m.user_id) || null }))
    return NextResponse.json({ team, members })
  } catch (error: any) {
    console.error("Team fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


