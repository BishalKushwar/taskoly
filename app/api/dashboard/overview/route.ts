import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = await getDb()
    const memberships = await db.collection("team_members").find({ user_id: user.id }).toArray()
    const teamIds = memberships.map((m: any) => m.team_id)

    const projects = await db.collection("projects").find({ team_id: { $in: teamIds } }).sort({ created_at: -1 }).limit(10).toArray()

    const projectIds = projects.map((p: any) => p.id)
    const recentTasks = await db.collection("tasks").find({ project_id: { $in: projectIds } }).sort({ created_at: -1 }).limit(5).toArray()

    const teams = await db.collection("teams").find({ id: { $in: teamIds } }).project({ id: 1, name: 1, description: 1, avatar_url: 1, subscription_tier: 1 }).toArray()
    const teamMap = new Map(teams.map((t: any) => [t.id, t]))

    const projectsWithTeam = projects.map((p: any) => ({ ...p, teams: teamMap.get(p.team_id) || null }))

    // Add project names to tasks
    const projectMap = new Map(projects.map((p: any) => [p.id, p]))
    const recentTasksWithProject = recentTasks.map((t: any) => ({ ...t, projects: { name: projectMap.get(t.project_id)?.name } }))

    return NextResponse.json({ teams, projects: projectsWithTeam, recentTasks: recentTasksWithProject })
  } catch (error: any) {
    console.error("Dashboard overview error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


