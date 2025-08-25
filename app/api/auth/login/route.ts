import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signToken } from "@/lib/auth"
import { AuthUserModel } from "@/models/AuthUser"
import { UserModel } from "@/models/User"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }
    const AuthUser = await AuthUserModel()
    const user = await AuthUser.findOne({ email }).lean()
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    const User = await UserModel()
    const profile = await User.findOne({ id: user.id }).lean()
    const token = signToken({ id: user.id, email, full_name: profile?.full_name, avatar_url: profile?.avatar_url })
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
    console.error("Login error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


