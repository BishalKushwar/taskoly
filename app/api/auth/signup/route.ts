import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import bcrypt from "bcryptjs"
import { signToken } from "@/lib/auth"
import { AuthUserModel } from "@/models/AuthUser"
import { UserModel } from "@/models/User"

export async function POST(request: Request) {
  try {
    const { email, password, full_name, avatar_url } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }
    const AuthUser = await AuthUserModel()
    const existing = await AuthUser.findOne({ email }).lean()
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    const userId = randomUUID()
    const password_hash = await bcrypt.hash(password, 10)
    const now = new Date().toISOString()
    await (await AuthUserModel()).create({ id: userId, email, password_hash, created_at: now })
    const User = await UserModel()
    await User.create({ id: userId, email, full_name: full_name || "", avatar_url: avatar_url || "", role: "member", team_id: null, created_at: now, updated_at: now })
    const token = signToken({ id: userId, email, full_name, avatar_url })
    const res = NextResponse.json({ success: true })
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (error: any) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


