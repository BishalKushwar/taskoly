import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = await getDb()
    const project = await db.collection("projects").findOne({ id: params.id })
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Access: ensure user is member of the team
    if (project.team_id) {
      const membership = await db.collection("team_members").findOne({ team_id: project.team_id, user_id: user.id })
      if (!membership) return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const team = project.team_id
      ? await db.collection("teams").findOne({ id: project.team_id }, { projection: { id: 1, name: 1, avatar_url: 1 } as any })
      : null

    return NextResponse.json({ project: { ...project, teams: team } })
  } catch (error: any) {
    console.error("Project detail error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


