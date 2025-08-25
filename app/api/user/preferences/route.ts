import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = await getDb()
    const prefs = await db.collection("user_preferences").findOne({ user_id: user.id })
    return NextResponse.json({ preferences: prefs || null })
  } catch (error: any) {
    console.error("Preferences get error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const updates = await request.json()
    const db = await getDb()
    const now = new Date().toISOString()
    await db.collection("user_preferences").updateOne(
      { user_id: user.id },
      { $set: { ...updates, updated_at: now }, $setOnInsert: { user_id: user.id, created_at: now } },
      { upsert: true }
    )
    const prefs = await db.collection("user_preferences").findOne({ user_id: user.id })
    return NextResponse.json({ success: true, preferences: prefs })
  } catch (error: any) {
    console.error("Preferences update error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


