import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/mongodb"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export async function PUT(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { currentPassword, newPassword } = await request.json()
    if (!newPassword || newPassword.length < 6) return NextResponse.json({ error: "Password too short" }, { status: 400 })

    const db = await getDb()
    const authUser = await db.collection("auth_users").findOne({ id: user.id })
    if (!authUser) return NextResponse.json({ error: "User not found" }, { status: 404 })
    const ok = await bcrypt.compare(currentPassword || "", authUser.password_hash)
    if (!ok) return NextResponse.json({ error: "Current password incorrect" }, { status: 400 })

    const password_hash = await bcrypt.hash(newPassword, 10)
    await db.collection("auth_users").updateOne({ id: user.id }, { $set: { password_hash } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Password update error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


