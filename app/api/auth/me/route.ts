import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const db = await getDb()
    const profile = await db.collection("users").findOne({ id: payload.id })
    return NextResponse.json({ user: payload, profile })
  } catch (error: any) {
    console.error("Me error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


