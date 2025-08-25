import { NextResponse } from "next/server"
import { TeamMemberModel } from "@/models/TeamMember"
import { ProjectModel } from "@/models/Project"
import { TeamModel } from "@/models/Team"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

// GET /api/projects?teamIds=commaSeparated
export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const teamIdsParam = url.searchParams.get("teamIds")
    const teamIds = teamIdsParam ? teamIdsParam.split(",").filter(Boolean) : []

    // Filter by user's membership if teamIds not provided
    let filter: any = {}
    if (teamIds.length > 0) {
      filter.team_id = { $in: teamIds }
    } else {
      const TeamMember = await TeamMemberModel()
      const memberships = await TeamMember.find({ user_id: user.id }, { team_id: 1 }).lean()
      const ids = memberships.map((m: any) => m.team_id)
      filter.team_id = { $in: ids }
    }
    const Project = await ProjectModel()
    const projects = await Project.find(filter).sort({ created_at: -1 }).limit(100).lean()

    // Enrich with team names
    const ids = Array.from(new Set(projects.map((p: any) => p.team_id).filter(Boolean)))
    const Team = await TeamModel()
    const teams = await Team.find({ id: { $in: ids } }, { id: 1, name: 1, avatar_url: 1 }).lean()
    const teamMap = new Map(teams.map((t: any) => [t.id, t]))
    const result = projects.map((p: any) => ({ ...p, teams: teamMap.get(p.team_id) || null }))

    return NextResponse.json({ projects: result })
  } catch (error: any) {
    console.error("Projects list error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


