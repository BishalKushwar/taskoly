import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

// GET /api/teams -> list teams for current user with role
export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = await getDb()
    const memberships = await db.collection("team_members").find({ user_id: user.id }).toArray()
    const teamIds = memberships.map((m: any) => m.team_id)
    const teams = await db.collection("teams").find({ id: { $in: teamIds } }).toArray()
    const roleMap = new Map(memberships.map((m: any) => [m.team_id, m.role]))
    const result = teams.map((t: any) => ({ ...t, role: roleMap.get(t.id) }))

    return NextResponse.json({ teams: result })
  } catch (error: any) {
    console.error("Teams list error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


