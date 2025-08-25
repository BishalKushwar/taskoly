import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { getDb } from "@/lib/mongodb"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

// GET /api/messages?projectId=...
export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const projectId = url.searchParams.get("projectId")
    if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 })

    const db = await getDb()
    const project = await db.collection("projects").findOne({ id: projectId })
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
    if (project.team_id) {
      const membership = await db.collection("team_members").findOne({ team_id: project.team_id, user_id: user.id })
      if (!membership) return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const msgs = await db.collection("messages").find({ project_id: projectId }).sort({ created_at: 1 }).toArray()
    const userIds = Array.from(new Set(msgs.map((m: any) => m.user_id)))
    const users = await db.collection("users").find({ id: { $in: userIds } }).project({ id: 1, full_name: 1, avatar_url: 1, email: 1 }).toArray()
    const userMap = new Map(users.map((u: any) => [u.id, u]))
    const messages = msgs.map((m: any) => ({ ...m, users: userMap.get(m.user_id) || null }))

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error("Messages fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/messages
export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { content, message_type, file_url, file_name, file_size, projectId } = await request.json()
    if (!projectId || !content) return NextResponse.json({ error: "content and projectId required" }, { status: 400 })

    const db = await getDb()
    const project = await db.collection("projects").findOne({ id: projectId })
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
    if (project.team_id) {
      const membership = await db.collection("team_members").findOne({ team_id: project.team_id, user_id: user.id })
      if (!membership) return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const id = randomUUID()
    const now = new Date().toISOString()
    const doc = {
      _id: id,
      id,
      content,
      message_type: message_type || "text",
      file_url: file_url || null,
      file_name: file_name || null,
      file_size: file_size || null,
      created_at: now,
      user_id: user.id,
      project_id: projectId,
    }
    await db.collection("messages").insertOne(doc)
    return NextResponse.json({ success: true, message: doc })
  } catch (error: any) {
    console.error("Message create error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


