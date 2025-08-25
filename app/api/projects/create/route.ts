import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { TeamMemberModel } from "@/models/TeamMember"
import { ProjectModel } from "@/models/Project"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, description, team_id, due_date, status, priority } = await request.json()
    if (!name) return NextResponse.json({ error: "Project name is required" }, { status: 400 })

    // If team_id provided, ensure requester is a member
    if (team_id) {
      const TeamMember = await TeamMemberModel()
      const membership = await TeamMember.findOne({ team_id, user_id: user.id }).lean()
      if (!membership) return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const id = randomUUID()
    const now = new Date().toISOString()
    const project = {
      _id: id,
      id,
      name,
      description: description || "",
      team_id: team_id || null,
      created_by: user.id,
      status: status || "active",
      priority: priority || "medium",
      start_date: null,
      due_date: due_date || null,
      created_at: now,
      updated_at: now,
    }

    const Project = await ProjectModel()
    await Project.create(project)

    return NextResponse.json({ success: true, project })
  } catch (error: any) {
    console.error("Project create error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


