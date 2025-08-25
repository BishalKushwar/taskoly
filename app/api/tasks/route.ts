import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { TaskModel } from "@/models/Task"
import { ProjectModel } from "@/models/Project"
import { TeamMemberModel } from "@/models/TeamMember"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

// GET /api/tasks?projectId=... -> list tasks for a project
export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const projectId = url.searchParams.get("projectId")
    if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 })

    const Task = await TaskModel()
    const tasks = await Task.find({ project_id: projectId }).sort({ position: 1 }).lean()

    // join user details
    const userIds = Array.from(new Set(tasks.flatMap((t: any) => [t.assigned_to, t.created_by]).filter(Boolean)))
    const users = await (await (await import("@/models/User")).UserModel)().find(
      { id: { $in: userIds } },
      { id: 1, full_name: 1, avatar_url: 1, email: 1 },
    ).lean()
    const userMap = new Map(users.map((u: any) => [u.id, u]))
    const result = tasks.map((t: any) => ({
      ...t,
      assigned_user: t.assigned_to ? userMap.get(t.assigned_to) || null : null,
      created_by_user: t.created_by ? userMap.get(t.created_by) || null : null,
    }))

    return NextResponse.json({ tasks: result })
  } catch (error: any) {
    console.error("Tasks list error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/tasks -> create task
export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, description, status, priority, assigned_to, due_date, project_id } = body
    if (!title || !project_id) return NextResponse.json({ error: "title and project_id required" }, { status: 400 })

    // Validate access via project->team->membership
    const Project = await ProjectModel()
    const project = await Project.findOne({ id: project_id }).lean()
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
    if (project.team_id) {
      const TeamMember = await TeamMemberModel()
      const membership = await TeamMember.findOne({ team_id: project.team_id, user_id: user.id }).lean()
      if (!membership) return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const now = new Date().toISOString()
    const id = randomUUID()
    const task = {
      _id: id,
      id,
      title,
      description: description || "",
      status: status || "todo",
      priority: priority || "medium",
      assigned_to: assigned_to || null,
      due_date: due_date || null,
      project_id,
      created_by: user.id,
      position: 0,
      created_at: now,
      updated_at: now,
    }
    const Task = await TaskModel()
    await Task.create(task)

    return NextResponse.json({ success: true, task })
  } catch (error: any) {
    console.error("Task create error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/tasks -> update status/position or other fields
export async function PUT(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id, updates } = await request.json()
    if (!id || !updates) return NextResponse.json({ error: "id and updates required" }, { status: 400 })

    const Task = await TaskModel()
    const task = await Task.findOne({ id }).lean()
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    // Access via project->team->membership
    const Project = await ProjectModel()
    const project = await Project.findOne({ id: task.project_id }).lean()
    if (project?.team_id) {
      const membership = await db.collection("team_members").findOne({ team_id: project.team_id, user_id: user.id })
      if (!membership) return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await Task.updateOne({ id }, { $set: { ...updates, updated_at: new Date().toISOString() } })
    const updated = await Task.findOne({ id }).lean()
    return NextResponse.json({ success: true, task: updated })
  } catch (error: any) {
    console.error("Task update error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/tasks?id=...
export async function DELETE(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const Task = await TaskModel()
    const task = await Task.findOne({ id }).lean()
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })
    const Project = await ProjectModel()
    const project = await Project.findOne({ id: task.project_id }).lean()
    if (project?.team_id) {
      const membership = await db.collection("team_members").findOne({ team_id: project.team_id, user_id: user.id })
      if (!membership) return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await Task.deleteOne({ id })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Task delete error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


