import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = await getDb()
    const nowIso = new Date().toISOString()
    await db.collection("users").updateOne(
      { id: user.id },
      {
        $setOnInsert: {
          id: user.id,
          email: user.email,
          full_name: (user.user_metadata as any)?.full_name || "",
          avatar_url: (user.user_metadata as any)?.avatar_url || "",
          role: "member",
          team_id: null,
          created_at: nowIso,
        },
        $set: { updated_at: nowIso },
      },
      { upsert: true }
    )

    const profile = await db.collection("users").findOne({ id: user.id })
    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const payload = token ? verifyToken(token) : null
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { userId, updates } = await request.json()
    if (!userId || userId !== payload.id) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }
    const db = await getDb()
    const now = new Date().toISOString()
    await db.collection("users").updateOne(
      { id: userId },
      { $set: { ...(updates || {}), updated_at: now } }
    )
    const profile = await db.collection("users").findOne({ id: userId })
    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


