import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function PUT(request: Request) {
  try {
    const { teamId, name, description, avatar_url } = await request.json()

    // Get current user from Authorization header
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!teamId || !name) {
      return NextResponse.json({ error: "Team ID and name are required" }, { status: 400 })
    }

    const db = await getDb()
    const member = await db.collection("team_members").findOne({ team_id: teamId, user_id: user.id })
    if (!member) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    if (!["owner", "admin"].includes(member.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const now = new Date().toISOString()
    await db.collection("teams").updateOne({ id: teamId }, {
      $set: {
        name,
        description,
        avatar_url,
        updated_at: now,
      },
    })

    const team = await db.collection("teams").findOne({ id: teamId })

    return NextResponse.json({
      success: true,
      team,
      message: "Team updated successfully",
    })

  } catch (error: any) {
    console.error("Team update error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
