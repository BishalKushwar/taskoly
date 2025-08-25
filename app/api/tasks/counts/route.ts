import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

// GET /api/tasks/counts?projectIds=a,b,c -> returns [{ project_id, status, count }]
export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const idsParam = url.searchParams.get("projectIds")
    const projectIds = idsParam ? idsParam.split(",").filter(Boolean) : []
    if (projectIds.length === 0) return NextResponse.json({ counts: [] })

    const db = await getDb()

    // Ensure access: find projects and verify membership
    const projects = await db.collection("projects").find({ id: { $in: projectIds } }).toArray()
    const teamIds = Array.from(new Set(projects.map((p: any) => p.team_id).filter(Boolean)))
    if (teamIds.length > 0) {
      const membership = await db.collection("team_members").findOne({ user_id: user.id, team_id: { $in: teamIds } as any })
      if (!membership) return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const pipeline = [
      { $match: { project_id: { $in: projectIds } } },
      { $group: { _id: { project_id: "$project_id", status: "$status" }, count: { $sum: 1 } } },
      { $project: { _id: 0, project_id: "$_id.project_id", status: "$_id.status", count: 1 } },
    ]
    const agg = await db.collection("tasks").aggregate(pipeline).toArray()
    return NextResponse.json({ counts: agg })
  } catch (error: any) {
    console.error("Task counts error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


